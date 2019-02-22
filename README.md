# Bacteria-Zapper
A basic JavaScript game using WebGL in which the player must act fast and click on the growing bacteria in order to destroy it.

2D Game Project for COMP-4471 - Computer Graphics

# Project Checklist
1.	The playing field starts as a circular disk centered at the origin. ✔
2.	The player views the disk from above. ✔
3.	Bacteria grow on the circumference of the disk starting at an arbitrary spot on the circumference and growing out uniformly in each direction from that spot at a speed determined by the game. ✔
4.	The player needs to eradicate the bacteria by placing the mouse over the bacteria and hitting a button. ✔
5.	The effect of the poison administered is to immediately remove the poisoned bacteria. ✔
6.	The game can randomly generate up to a fixed number (say 10) different bacteria (each a different color). ✔
7.	The bacteria appear as a crust on the circumference of the disk. ✔ (Is this different than 3.?)
8.	The game gains points through the delays in the user responding and by any specific bacteria reaching a threshold (for example a 30 degree arc). ✔
9.	The player wins if all bacteria are poisoned before any two different bacteria reach the threshold mentioned above ✔

# Bonus Features Checklist
1.	The effect of the poison administered also propagates outward from the point of insertion of the position until all the bacteria are destroyed.
2.	When two bacteria cultures collide, the first one to appear on the circumference dominates and consumes the later generated bacteria.
3.	When a bacterial culture is hit, use a simple 2D particle system to simulate an explosion at the point where the poison is administered.
