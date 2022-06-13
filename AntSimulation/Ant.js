class Ant
{
    constructor(_cell, _direction)
    {
        this.cell = _cell;
        this.direction = _direction;
        this.state = AntState.SEEKER;

        this.homePath = [];
    }

    MoveForward(_cellToMove)
    {
        if (this.state == AntState.SEEKER)
        {
            this.cell.pathToHome = true;
            this.homePath.push(this.cell);
        }

        this.cell = _cellToMove;
    }

    Rotate()
    {
        switch (this.direction)
        {
            case Direction.NORTH:
                this.direction = Direction.EAST;
                break;
            case Direction.SOUTH:
                this.direction = Direction.WEST;
                break;
            case Direction.EAST:
                this.direction = Direction.SOUTH;
                break;
            case Direction.WEST:
                this.direction = Direction.NORTH;
                break;
            default:
                console.log("Error: Invalid direction");
                break;

            // case Direction.NORTH:
            //     this.direction = Math.random() > 0.5 ? Direction.EAST : Direction.WEST;
            //     break;
            // case Direction.SOUTH:
            //     this.direction = Math.random() > 0.5 ? Direction.EAST : Direction.WEST;
            //     break;
            // case Direction.EAST:
            //     this.direction = Math.random() > 0.5 ? Direction.NORTH : Direction.SOUTH;
            //     break;
            // case Direction.WEST:
            //     this.direction = Math.random() > 0.5 ? Direction.NORTH : Direction.SOUTH;
            //     break;
            // default:
            //     console.log("Error: Invalid direction");
            //     break;
        }
    }

    SearchFood(_forwardTiles)
    {
        let moveToCell = _forwardTiles[0];

        for (let cell of _forwardTiles)
        {
            if (!cell.nest && cell.food > 0 || (cell.pheromone > moveToCell.pheromone && moveToCell.food == 0))
            {
                moveToCell = cell;
            }
        }

        if (moveToCell.pheromone == 0 && moveToCell.food == 0)
        {
            do
            {
                moveToCell = _forwardTiles[Math.floor(Math.random() * _forwardTiles.length)];
            } while (moveToCell.pheromone == 0 && moveToCell.nest);
        }

        if (moveToCell.food > 0)
        {
            moveToCell.food -= 1;
            this.state = AntState.RETURNER;
        }
        else
        {
            this.MoveForward(moveToCell);
        }
    }

    ReturnHome()
    {
        let cellToMove = this.homePath.pop();

        cellToMove.pheromone = 1;
        cellToMove.pathToHome = false;

        this.MoveForward(cellToMove);
    }

    DrawAnt(_cellSize, _offset)
    {
        if (this.state == AntState.SEEKER)
            fill(0, 0, 0);
        else
            fill(0, 255, 0);
    
        square(this.cell.x * _cellSize + _offset, this.cell.y * _cellSize + _offset, _cellSize);
    }
}

const Direction = {
    NORTH: 0,
    SOUTH: 1,
    EAST: 2,
    WEST: 3
}

const AntState = 
{
    SEEKER: 0,
    RETURNER: 1
}