let Cells = []; // Array to store cells.
let Ants = [];
let Food = [];
let PheromonePath = [];
let Nest = [];
let CellSize = 3; // Size of each cell.
let Offset = 50; // Offset in X and Y. Shifts the draw point of the screen from top left corner.

let XSize = 300; // Number of cells in X.
let YSize = 180; // Number of cells in Y.

let NestFood = 0;
let Time = 0;

// Sets up the simulation.
function setup()
{
	createCanvas(XSize * CellSize + (Offset * 2), YSize * CellSize + (Offset * 2)); // Create Canvas.
	// strokeWeight(0);

	Init();
	SpawnFood(0, 0, 10);
	SpawnFood(XSize - 10, 0, 10);
	SpawnFood(0, YSize - 10, 10);
	SpawnFood(XSize - 10, YSize - 10, 10);

	SpawnNest();

	for (let i = 0; i < 2; i++)
		Ants.push(new Ant(Cells[YSize / 2][XSize / 2], Math.floor(Math.random() * 8)));
		// Ants.push(new Ant(Cells[YSize / 2][XSize / 2], 0));
}

function draw()
{
	Time += deltaTime / 1000;
	background(180); // Color background.
	fill("black"); // Color text.
	textSize(16);
	text('Ants:' + Ants.length, 10, 20);
	text('Food:' + Food.length, 100, 20);

	// if (Time > 5)
	// {
	// 	Time = 0;

		for (let i = 0; i < 3; i++)
		{
			if (NestFood >= 5)
			{
				Ants.push(new Ant(Cells[YSize / 2][XSize / 2], Direction.NORTH));
				NestFood -= 5;
			}
			else
			{
				break;
			}
		}
	// }

	noFill();
	rect(Offset, Offset, XSize * CellSize, YSize * CellSize);

	DrawFood();
	DrawNest();

	DrawPheromoneTrail();
	SimulateAnts();	
}

function Init()
{
	for (let y = 0; y < YSize; y++)
	{
		Cells[y] = [];

		for (let x = 0; x < XSize; x++)
		{
			Cells[y][x] = new Cell(x, y);
		}
	}
}

function SimulateAnts()
{
	for (let ant of Ants)
	{
		if (ant.state == AntState.SEEKER)
		{
			let forwardTiles = GetForwardTiles(ant);
			ant.SearchFood(forwardTiles);
		}
		else if (ant.homePath.length > 0)
		{
			PheromonePath.push(ant.cell);
			ant.ReturnHome();
		}
		else
		{
			NestFood += 1;
			ant.LookForPheromone(Cells);
			ant.state = AntState.SEEKER;
		}

		ant.DrawAnt(CellSize, Offset);
	}
}

function GetForwardTiles(ant)
{
	let forwardTiles = [];

	while (forwardTiles.length == 0)
	{
		switch (ant.direction)
		{
			case Direction.NORTH:				
				if (ant.cell.y - 1 >= 0)
				{
					for (let x = -1; x < 2; x++)
					{
						if (ant.cell.x + x >= 0 && ant.cell.x + x < XSize)
						{
							forwardTiles.push(Cells[ant.cell.y - 1][ant.cell.x + x]);
						}
					}
				}
				break;
			case Direction.NORTH_EAST:
				if (ant.cell.y - 1 >= 0 && ant.cell.x + 1 < XSize)
				{
					forwardTiles.push(Cells[ant.cell.y - 1][ant.cell.x]); // Top
					forwardTiles.push(Cells[ant.cell.y - 1][ant.cell.x + 1]); // Top Right
					forwardTiles.push(Cells[ant.cell.y][ant.cell.x + 1]); // Right
				}
				break;
			case Direction.EAST:
				if (ant.cell.x + 1 < XSize)
				{
					for (let y = -1; y < 2; y++)
					{
						if (ant.cell.y + y >= 0 && ant.cell.y + y < YSize)
						{
							forwardTiles.push(Cells[ant.cell.y + y][ant.cell.x + 1]);
						}
					}
				}
				break;
			case Direction.SOUTH_EAST:
				if (ant.cell.y + 1 < YSize && ant.cell.x + 1 < XSize)
				{
					forwardTiles.push(Cells[ant.cell.y][ant.cell.x + 1]); // Right
					forwardTiles.push(Cells[ant.cell.y + 1][ant.cell.x + 1]); // Bottom Right
					forwardTiles.push(Cells[ant.cell.y + 1][ant.cell.x]); // Bottom
				}
				break;
			case Direction.SOUTH:
				if (ant.cell.y + 1 < YSize)
				{
					for (let x = -1; x < 2; x++)
					{
						if (ant.cell.x + x >= 0 && ant.cell.x + x < XSize)
						{
							forwardTiles.push(Cells[ant.cell.y + 1][ant.cell.x + x]);
						}
					}
				}
				break;
			case Direction.SOUTH_WEST:
				if (ant.cell.y + 1 < YSize && ant.cell.x - 1 >= 0)
				{
					forwardTiles.push(Cells[ant.cell.y][ant.cell.x - 1]); // Left
					forwardTiles.push(Cells[ant.cell.y + 1][ant.cell.x - 1]); // Bottom Left
					forwardTiles.push(Cells[ant.cell.y + 1][ant.cell.x]); // Bottom
				}
				break;
			case Direction.WEST:
				if (ant.cell.x - 1 >= 0)
				{
					for (let y = -1; y < 2; y++)
					{
						if (ant.cell.y + y >= 0 && ant.cell.y + y < YSize)
						{
							forwardTiles.push(Cells[ant.cell.y + y][ant.cell.x - 1]);
						}
					}
				}
				break;
			case Direction.NORTH_WEST:
				if (ant.cell.y - 1 >= 0 && ant.cell.x - 1 >= 0)
				{
					forwardTiles.push(Cells[ant.cell.y - 1][ant.cell.x]); // Top
					forwardTiles.push(Cells[ant.cell.y - 1][ant.cell.x - 1]); // Top Left
					forwardTiles.push(Cells[ant.cell.y][ant.cell.x - 1]); // Left
				}
				break;
		}

		let nest = 0;
		for (let tile of forwardTiles)
		{
			if (tile && tile.nest)
				nest++;
			// else if (!tile)
			// 	console.log(forwardTiles, ant.direction);
		}

		if (forwardTiles.length == 0 || nest == forwardTiles.length)
		{
			ant.Rotate();
			forwardTiles = [];
		}
	}
	
	return forwardTiles;
}

function SpawnFood(_foodStartX, _foodStartY, _amountOfFood)
{
	for (let y = _foodStartY; y < _foodStartY + _amountOfFood; y++)
	{
		for (let x = _foodStartX; x < _foodStartX + _amountOfFood; x++)
		{
			Cells[y][x].food = 1;
			Food.push(Cells[y][x]);
		}
	}
}

function DrawFood()
{
	fill(0, 255, 0);

	for (let food of Food)
	{
		if (food.food > 0)
		{
			square(food.x * CellSize + Offset, food.y * CellSize + Offset, CellSize);
		}
		else
		{
			let foodIndex = Food.indexOf(food);

			if (foodIndex !== -1)
			{
				Food.splice(foodIndex, 1);
			}
		}
	}
}

function SpawnNest()
{
	let nestStartX = XSize / 2;
	let nestStartY = YSize / 2;
	let nestSize = 5;

	for (let y = nestStartY; y < nestStartY + nestSize; y++)
	{
		for (let x = nestStartX; x < nestStartX + nestSize; x++)
		{
			Cells[y][x].nest = true;
			Nest.push(Cells[y][x]);
		}
	}
}

function DrawNest()
{
	fill('yellow');

	for (let nestCell of Nest)
	{
		square(nestCell.x * CellSize + Offset, nestCell.y * CellSize + Offset, CellSize);
	}
}

function DrawPheromoneTrail()
{
	// for (let cell of PheromonePath)
	// {
	// 	if (cell.pheromone > 0)
	// 	{
	// 		fill(255, 0, 0, cell.pheromone * 255);
	// 		square(cell.x * CellSize + Offset, cell.y * CellSize + Offset, CellSize);
			
	// 		cell.UpdatePheromone();
	// 	}
	// 	else
	// 	{
	// 		let cellIndex = PheromonePath.indexOf(cell);

    //         if (cellIndex !== -1)
    //         {
    //             PheromonePath.splice(cellIndex, 1);
    //         }
	// 	}
	// }

	for (let y = 0; y < YSize; y++)
	{
		for (let x = 0; x < XSize; x++)
		{
			if (Cells[y][x].pheromone > 0)
			{
				fill(255, 0, 0, Cells[y][x].pheromone * 255);
				square(x * CellSize + Offset, y * CellSize + Offset, CellSize);

				Cells[y][x].UpdatePheromone();
			}
			else if (Cells[y][x].pathToHome)
			{
				fill(0, 0, 255, 50);
				square(x * CellSize + Offset, y * CellSize + Offset, CellSize);
			}
			// else if (Cells[y][x].food > 0)
			// {
			// 	fill(0, 255, 0);
			// 	square(x * CellSize + Offset, y * CellSize + Offset, CellSize);
			// }
			// else if (Cells[y][x].nest)
			// {
			// 	fill('yellow');
			// 	square(x * CellSize + Offset, y * CellSize + Offset, CellSize);
			// }
		}
	}
}