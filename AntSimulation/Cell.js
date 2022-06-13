class Cell
{
    constructor(x, y, state)
    {
        this.x = x;
        this.y = y;

        this.nest = false;
        this.food = 0;
        this.pheromone = 0;
        this.pathToHome = false;
    }

    UpdatePheromone()
    {
        if (this.pheromone > 0)
            this.pheromone -= 0.005;
    }
}