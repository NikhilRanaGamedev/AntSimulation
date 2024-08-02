# Note
This is just a Proof of Concept and a fun project. The code is not optimized.

# AntSimulation
Simulating a colony of ant on how they track food and work together.

# Logic
Ants leave their nest and start walking around randomly, keeping track of each step they take, until they find food. Once they have found food, they travel back through the path they came and leave a pheromone chemical on each step which others ant can smell to lead them to the food. The pheromone trail evaporates over time so once a food source has been exhausted ants stop going to it.

# Random Walking
An ant starts in a random direction when generated. At each step it takes a look at the three cells in front of it and picks the one with the strongest amount of pheromones. If no cells contains any pheremone, then the ant chooses a random cell from the three. While the ant is looking for food, it store each cell it steps on into an array which will be used to go back home. This path back to home is colored in blue on the screen.

# Pheromone Drop
When an ant finds food, it starts walking back home. At each step back, it drops a certain amount of pheromone on that cell. This pheromone can be smelled by the other ants to lead them to the food source. Over time, the pheromone trail evaoporates. This is a natural phenomenon as ants will keep going to the same food source even if there is not food until the pheromone evaporates. This pheromone trail is colored in red on the screen.

# Nest
The nest is where all the ants spawn from and carry food back to. It keeps track of a food counter which gets incremented everytime an ant brings home food. It spawns a new ant everytime it has five food and decrements the counter.

# Food
The food is shown by the green cells. A food cell can contain any amount of food to simulate a longer period of time. For now it has one food in each cell.
