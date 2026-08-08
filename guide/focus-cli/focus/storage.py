from __future__ import annotations

import json
import os
import tempfile
from copy import deepcopy
from datetime import datetime
from pathlib import Path
from typing import Any


class StorageError(RuntimeError):
    pass


DEFAULT_DATA = {
    "version": 1,
    "active_session": None,
    "sessions": [],
    "debug_sessions": [],
    "prayer_notes": [],
}


def _platform_locations() -> tuple[Path, Path]:
    override = os.environ.get("FOCUS_HOME")
    if override:
        root = Path(override).expanduser()
        return root, root / "data"

    if os.name == "nt":
        config_root = Path(os.environ.get("APPDATA", Path.home())) / "Focus"
        data_root = Path(os.environ.get("LOCALAPPDATA", config_root)) / "Focus"
        return config_root, data_root

    config_root = Path(os.environ.get("XDG_CONFIG_HOME", Path.home() / ".config"))
    data_root = Path(os.environ.get("XDG_DATA_HOME", Path.home() / ".local" / "share"))
    return config_root / "focus", data_root / "focus"


class Storage:
    """Loads and atomically saves the two local JSON files used by Focus."""

    def __init__(self, home: Path | None = None) -> None:
        if home is None:
            config_dir, default_data_dir = _platform_locations()
        else:
            config_dir = Path(home)
            default_data_dir = config_dir / "data"

        self.config_dir = config_dir
        self.default_data_dir = default_data_dir
        self.config_path = self.config_dir / "config.json"
        self.warnings: list[str] = []

        defaults = {
            "version": 1,
            "display_name": "",
            "color": "auto",
            "timer_minutes": 25,
            "data_dir": str(default_data_dir),
        }
        loaded_config = self._read_json(self.config_path, defaults)
        self.config = {**defaults, **loaded_config}
        self._validate_config()

        self.data_path = Path(self.config["data_dir"]).expanduser() / "focus-data.json"
        loaded_data = self._read_json(self.data_path, DEFAULT_DATA)
        self.data = self._merge_data(loaded_data)

    def _read_json(self, path: Path, default: dict[str, Any]) -> dict[str, Any]:
        if not path.exists():
            return deepcopy(default)
        try:
            with path.open("r", encoding="utf-8") as handle:
                value = json.load(handle)
            if not isinstance(value, dict):
                raise ValueError("top-level JSON value must be an object")
            return value
        except (json.JSONDecodeError, ValueError) as exc:
            stamp = datetime.now().strftime("%Y%m%d-%H%M%S")
            backup = path.with_name(f"{path.name}.corrupt-{stamp}")
            try:
                path.replace(backup)
            except OSError as move_error:
                raise StorageError(f"Could not recover invalid JSON at {path}: {move_error}") from move_error
            self.warnings.append(
                f"Invalid JSON was moved to {backup}; Focus started with safe defaults."
            )
            return deepcopy(default)
        except OSError as exc:
            raise StorageError(f"Could not read {path}: {exc}") from exc

    def _validate_config(self) -> None:
        if self.config["color"] not in {"auto", "always", "never"}:
            self.config["color"] = "auto"
            self.warnings.append("Unknown color setting was reset to auto.")
        try:
            minutes = int(self.config["timer_minutes"])
        except (TypeError, ValueError):
            minutes = 25
        if not 1 <= minutes <= 480:
            minutes = 25
            self.warnings.append("Invalid timer length was reset to 25 minutes.")
        self.config["timer_minutes"] = minutes
        self.config["display_name"] = str(self.config.get("display_name", ""))[:80]
        self.config["data_dir"] = str(
            Path(os.path.expandvars(str(self.config["data_dir"]))).expanduser()
        )

    @staticmethod
    def _merge_data(value: dict[str, Any]) -> dict[str, Any]:
        merged = deepcopy(DEFAULT_DATA)
        for key in merged:
            if key in value:
                merged[key] = value[key]
        for collection in ("sessions", "debug_sessions", "prayer_notes"):
            if not isinstance(merged[collection], list):
                merged[collection] = []
        if merged["active_session"] is not None and not isinstance(
            merged["active_session"], dict
        ):
            merged["active_session"] = None
        return merged

    def _write_json(self, path: Path, value: dict[str, Any]) -> None:
        temporary_name = None
        try:
            path.parent.mkdir(parents=True, exist_ok=True)
            with tempfile.NamedTemporaryFile(
                "w", encoding="utf-8", dir=path.parent, delete=False
            ) as handle:
                temporary_name = handle.name
                json.dump(value, handle, indent=2, ensure_ascii=False)
                handle.write("\n")
                handle.flush()
                os.fsync(handle.fileno())
            os.replace(temporary_name, path)
        except OSError as exc:
            if temporary_name:
                try:
                    Path(temporary_name).unlink(missing_ok=True)
                except OSError:
                    pass
            raise StorageError(f"Could not save {path}: {exc}") from exc

    def save_data(self) -> None:
        self._write_json(self.data_path, self.data)

    def save_config(self) -> None:
        self._write_json(self.config_path, self.config)

    def update_preferences(self, display_name: str, color: str, timer_minutes: int) -> None:
        if color not in {"auto", "always", "never"}:
            raise StorageError("Color must be auto, always, or never.")
        if not 1 <= timer_minutes <= 480:
            raise StorageError("Timer length must be between 1 and 480 minutes.")
        self.config.update(
            {
                "display_name": display_name.strip()[:80],
                "color": color,
                "timer_minutes": timer_minutes,
            }
        )
        self.save_config()

    def change_data_dir(self, new_dir: Path, use_existing: bool = False) -> None:
        new_dir = Path(new_dir).expanduser().resolve()
        new_path = new_dir / "focus-data.json"
        if new_path == self.data_path.resolve():
            return

        if new_path.exists():
            if not use_existing:
                raise StorageError(f"A Focus data file already exists in {new_dir}.")
            new_data = self._merge_data(self._read_json(new_path, DEFAULT_DATA))
        else:
            self._write_json(new_path, self.data)
            new_data = self.data

        # Save the config last so an interrupted copy never points at missing data.
        self.config["data_dir"] = str(new_dir)
        self.save_config()
        self.data_path = new_path
        self.data = new_data
