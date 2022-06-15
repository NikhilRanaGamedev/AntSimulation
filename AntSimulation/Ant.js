class Ant
{
    constructor(_cell, _direction)
    {
        this.cell = _cell; // The current cell of the ant.
        this.direction = _direction; // The direction of the ant.
        this.state = AntState.SEEKER;

        this.homePath = []; // Array containing cells that lead back to home.
        this.stepsLimit = 250; // Number of steps before an ant returns home if it has not found food.
        this.steps = this.stepsLimit;
    }

    /* #region Movement */
    MoveForward(_cellToMove)
    {
        // If searching for food, store each cell to create a path back to home.
        if (this.state == AntState.SEEKER)
        {
            this.cell.pathToHome += 1;
            this.homePath.push(this.cell);
        }

        this.cell.occupied = false; // Set
        _cellToMove.occupied = true;

        this.cell = _cellToMove;
    }

    Rotate()
    {
        let randomDirection = [];

        switch (this.direction)
        {
            // case Direction.NORTH:
            //     this.direction = Direction.NORTH_EAST;
            //     break;
            // case Direction.NORTH_EAST:
            //     this.direction = Direction.EAST;
            //     break;
            // case Direction.EAST:
            //     this.direction = Direction.SOUTH_EAST;
            //     break;
            // case Direction.SOUTH_EAST:
            //     this.direction = Direction.SOUTH;
            //     break;
            // case Direction.SOUTH:
            //     this.direction = Direction.SOUTH_WEST;
            //     break;
            // case Direction.SOUTH_WEST:
            //     this.direction = Direction.WEST;
            //     break;
            // case Direction.WEST:
            //     this.direction = Direction.NORTH_WEST;
            //     break;
            // case Direction.NORTH_WEST:
            //     this.direction = Direction.NORTH;
            //     break;
            // default:
            //     console.log("Error: Invalid direction");
            //     break;

            case Direction.NORTH:
                randomDirection = [Direction.WEST, Direction.NORTH_WEST, Direction.NORTH_EAST, Direction.EAST];
                break;
            case Direction.NORTH_EAST:
                randomDirection = [Direction.NORTH_WEST, Direction.NORTH, Direction.EAST, Direction.SOUTH_EAST];
                break;
            case Direction.EAST:
                randomDirection = [Direction.NORTH, Direction.NORTH_EAST, Direction.SOUTH_EAST, Direction.SOUTH];
                break;
            case Direction.SOUTH_EAST:
                randomDirection = [Direction.NORTH_EAST, Direction.EAST, Direction.SOUTH, Direction.SOUTH_WEST];
                break;
            case Direction.SOUTH:
                randomDirection = [Direction.EAST, Direction.SOUTH_EAST, Direction.SOUTH_WEST, Direction.WEST];
                break;
            case Direction.SOUTH_WEST:
                randomDirection = [Direction.NORTH_EAST, Direction.SOUTH, Direction.WEST, Direction.NORTH_WEST];
                break;
            case Direction.WEST:
                randomDirection = [Direction.SOUTH, Direction.SOUTH_WEST, Direction.NORTH_WEST, Direction.NORTH];
                break;
            case Direction.NORTH_WEST:
                randomDirection = [Direction.SOUTH_WEST, Direction.WEST, Direction.NORTH, Direction.NORTH_EAST];
                break;
            default:
                console.log("Error: Invalid direction");
                break;
        }
        
        this.direction = randomDirection[Math.floor(Math.random() * randomDirection.length)];
    }
    /* #endregion */

    /* #region Food Search */
    SearchFood(_forwardTiles)
    {
        let moveToCell = _forwardTiles[0];

        for (let cell of _forwardTiles)
        {
            if (cell.food > 0 || (cell.pheromone > moveToCell.pheromone && moveToCell.food <= 0))
            {
                moveToCell = cell;
            }
        }

        if (moveToCell.pheromone == 0 && moveToCell.food == 0)
        {
            moveToCell = _forwardTiles[Math.floor(Math.random() * _forwardTiles.length)];
        }

        if (moveToCell.food > 0)
        {
            moveToCell.food -= 1;
            this.state = AntState.RETURNER;
        }
        else
        {
            this.MoveForward(moveToCell);

            if (moveToCell.pheromone <= 0)
                this.StopSearch();
        }
    }

    StopSearch()
    {
        this.steps -= 1;

        if (this.steps == 0)
        {
            this.state = AntState.FAILED_RETURNER;
        }
    }

    LookForPheromone(_cellsList)
    {
        let highestPheromone = 0;
        let direction = [Direction.NORTH_WEST, Direction.NORTH, Direction.NORTH_EAST, Direction.WEST, undefined, Direction.EAST, Direction.SOUTH_WEST, Direction.SOUTH, Direction.SOUTH_EAST];
        let index = 0;

        for (let y = -1; y < 2; y++)
        {
            for (let x = -1; x < 2; x++)
            {
                if (x != 0 && y != 0 && x + this.cell.x >= 0 && x + this.cell.x < _cellsList[0].length && y + this.cell.y >= 0 && y + this.cell.y < _cellsList.length)
                {
                    if (_cellsList[y + this.cell.y][x + this.cell.x].pheromone > highestPheromone)
                    {
                        highestPheromone = _cellsList[y + this.cell.y][x + this.cell.x].pheromone;
                        this.direction = direction[index];
                    }
                }

                index++;
            }
        }
    }    
    /* #endregion */

    ReturnHome()
    {
        let cellToMove = this.homePath.pop();

        if (this.state == AntState.RETURNER)
            cellToMove.pheromone += 1;
    
        cellToMove.pathToHome -= 1;

        this.MoveForward(cellToMove);
    }

    /* #region Draw */
    DrawAnt(_cellSize, _offset)
    {
        drawingContext.shadowBlur = 4;

        if (this.state == AntState.SEEKER || this.state == AntState.FAILED_RETURNER)
        {
            fill(0, 0, 0);
            drawingContext.shadowColor = color(255, 255, 0);
        }
        else
        {
            fill(0, 255, 0);
            drawingContext.shadowColor = color(0, 255, 0);
        }
    
        square(this.cell.x * _cellSize + _offset, this.cell.y * _cellSize + _offset, _cellSize);
        drawingContext.shadowBlur = 0;
    }
    /* #endregion */
}

const Direction = {
    NORTH: 0,
    NORTH_EAST: 1,
    EAST: 2,
    SOUTH_EAST: 3,
    SOUTH: 4,
    SOUTH_WEST: 5,
    WEST: 6,
    NORTH_WEST: 7
}

const AntState = 
{
    SEEKER: 0,
    RETURNER: 1,
    FAILED_RETURNER: 2
}