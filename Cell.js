class Cell
{
    constructor(x, y, state)
    {
        this.x = x;
        this.y = y;

        this.nest = false; // Is this tile a nest.
        this.food = 0; // Amount of food.
        this.pheromone = 0; // The concentration of pheromone (a hermone dropped by the ant to lead to the nest).
        this.pathToHome = 0; // How many ant have marked this cell as way to home.
        this.occupied = false; // Is occupied by an ant.
    }

    // Evaoporate the pheromone a little every turn.
    UpdatePheromone()
    {
        if (this.pheromone > 0)
            this.pheromone -= 0.003;

        if (this.pheromone < 0)
            this.pheromone = 0;
    }
}