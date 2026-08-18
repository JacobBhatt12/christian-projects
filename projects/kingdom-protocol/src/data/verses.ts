import type { Verse } from "../types";

export const VERSES: Verse[] = [
  { reference: "John 1:5", text: "And the light shineth in darkness; and the darkness comprehended it not." },
  { reference: "Joshua 1:9", text: "Be strong and of a good courage; be not afraid, neither be thou dismayed: for the LORD thy God is with thee whithersoever thou goest." },
  { reference: "Psalm 27:1", text: "The LORD is my light and my salvation; whom shall I fear?" },
  { reference: "Isaiah 41:10", text: "Fear thou not; for I am with thee: be not dismayed; for I am thy God: I will strengthen thee; yea, I will help thee." },
  { reference: "Romans 8:31", text: "If God be for us, who can be against us?" },
  { reference: "Philippians 4:13", text: "I can do all things through Christ which strengtheneth me." },
  { reference: "Proverbs 3:5-6", text: "Trust in the LORD with all thine heart; and lean not unto thine own understanding." },
  { reference: "Matthew 5:14", text: "Ye are the light of the world. A city that is set on an hill cannot be hid." },
  { reference: "2 Timothy 1:7", text: "God hath not given us the spirit of fear; but of power, and of love, and of a sound mind." },
  { reference: "Psalm 46:1", text: "God is our refuge and strength, a very present help in trouble." },
  { reference: "Ephesians 6:10", text: "Finally, my brethren, be strong in the Lord, and in the power of his might." },
  { reference: "Jeremiah 29:11", text: "I know the thoughts that I think toward you, saith the LORD, thoughts of peace, and not of evil, to give you an expected end." },
  { reference: "Isaiah 40:31", text: "They that wait upon the LORD shall renew their strength; they shall mount up with wings as eagles." },
  { reference: "John 8:12", text: "I am the light of the world: he that followeth me shall not walk in darkness, but shall have the light of life." },
  { reference: "Psalm 119:105", text: "Thy word is a lamp unto my feet, and a light unto my path." },
  { reference: "Matthew 11:28", text: "Come unto me, all ye that labour and are heavy laden, and I will give you rest." },
  { reference: "Galatians 2:20", text: "I am crucified with Christ: nevertheless I live; yet not I, but Christ liveth in me." },
  { reference: "1 Corinthians 16:14", text: "Let all your things be done with charity." },
  { reference: "Romans 12:2", text: "Be not conformed to this world: but be ye transformed by the renewing of your mind." },
  { reference: "Psalm 34:18", text: "The LORD is nigh unto them that are of a broken heart; and saveth such as be of a contrite spirit." },
  { reference: "Nehemiah 8:10", text: "The joy of the LORD is your strength." },
  { reference: "Colossians 3:23", text: "And whatsoever ye do, do it heartily, as to the Lord, and not unto men." },
];

export function randomVerse(): Verse {
  return VERSES[Math.floor(Math.random() * VERSES.length)];
}
