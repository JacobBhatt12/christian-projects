# Design System

## Direction

A warm paper workspace for a person using Bread & Light privately in ordinary daylight or lamplight. The interface borrows the restraint of a community handout and the tactility of a personal journal, while retaining familiar desktop-app navigation and form behavior.

## Color

Use OKLCH tokens. Warm ivory is the primary paper surface, flax and stone create secondary layers, charcoal-brown carries text, and one muted evergreen accent marks active state, focus, handwritten notes, and primary actions. Error messaging uses a reserved earthy red. No pure black or white, gradients, or translucent glass layers.

## Typography

Use the native system sans stack for interface text, labels, headings, and controls. Use a Georgia-like serif for Scripture and restrained numerals. Use a small handwritten fallback stack only for marginal phrases. Keep prose at 65 characters or less and build hierarchy with size and weight rather than ornament.

## Shape and Elevation

Corners are square or nearly square, at most 0.2rem. Buttons, fields, cards, navigation selections, number markers, and the mobile dock are never pill-shaped or circular. Quiet raised and inset shadows should suggest stacked paper and letterpress without gloss.

## Layout

Desktop uses a full-height shell with a fixed-width left navigation and independently scrolling workspace. Main content is centered at a readable width. Below 704 pixels, remove the shell frame and convert navigation to a square-cornered fixed bottom dock with enough content clearance.

## Components

Time choices are full-width selectable rows, not generic icon cards. Ideas and reflections use ruled-paper divisions rather than repeated floating cards. Inputs are large, square textareas with strong labels and visible hints. Primary and secondary buttons share one consistent, square vocabulary with 44-pixel minimum height.

## Motion

Use 150 to 200 millisecond color, border, opacity, and transform transitions with a quiet ease-out curve. Motion only communicates hover, press, focus, or state change. Under reduced motion, reduce transitions and disable smooth scrolling.
