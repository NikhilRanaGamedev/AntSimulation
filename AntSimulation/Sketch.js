let Cells = []; // Array to store cells.
let Ants = [];
let Food = [];
let PheromonePath = new Set(); // Store cells that are either marked as path to home or food.
let Nest = [];
let CellSize = 3; // Size of each cell.
let Offset = 50; // Offset in X and Y. Shifts the draw point of the screen from top left corner.

let XSize = 360; // Number of cells in X.
let YSize = 160; // Number of cells in Y.

let Simulate = false; // Has simulation started.

let NestFood = 0; // Food brought by ants.
let AntWithFood = 0;
let StartingAntsAmount = 0;

/* #region P5.js Functions */
// Sets up the simulation.
function setup()
{
	createCanvas(XSize * CellSize + (Offset * 2), YSize * CellSize + (Offset * 2)); // Create Canvas.
	background(180);
	// strokeWeight(0);

	DrawInputsText();
	DrawInputBoxes();
}

function draw()
{
	if (Simulate)
	{
		background(180); // Color background.
		noFill();
		rect(Offset, Offset, XSize * CellSize, YSize * CellSize); // Draw the outline.
		DrawText(); // Draw text and values.
	
		SpawnNewAnts(); // Check if new ant can be spawned.
	
		DrawFood(); // Draw the food.
		DrawPheromoneTrail(); // Draw the blue and red trails.
		
		SimulateAnts(); // Simulate each ant.
		
		DrawNest(); // Draw the nest.
	}
}
/* #endregion */

/* #region Initialize */
function Init()
{
	// Initialize cells
	for (let y = 0; y < YSize; y++)
	{
		Cells[y] = [];

		for (let x = 0; x < XSize; x++)
		{
			Cells[y][x] = new Cell(x, y);
		}
	}

	// Spawn Food at various location.
	SpawnFood(0, 0, 50);
	// SpawnFood(XSize - 10, 0, 10);
	// SpawnFood(0, YSize - 10, 10);
	// SpawnFood(XSize - 10, YSize - 10, 10);

	// Spawn the nest.
	SpawnNest(XSize / 2, YSize / 2, 3);
}

function DrawText()
{
	fill("black");
	textSize(16);

	text('Ants:' + Ants.length, 10, 20);
	text('Food:' + Food.length, 100, 20);
	text('Nest Food:' + NestFood, 200, 20);
	text('Ant Carrying Food:' + AntWithFood, 320, 20);
	text('FPS:' + frameRate().toFixed(0), 500, 20);
}

// Draws the text for the input boxes.
function DrawInputsText()
{
    text('X:', 10, 20);
    text('Y:', 150, 20);
    text('Cell Size:', 300, 20);
    text('Ants to Spawn at Start:', 475, 20);
}

// Draws the input boxes.
function DrawInputBoxes()
{
	// Take X Size.
    let inputXSize = createInput(360, int);
    inputXSize.size(100, 25);
    inputXSize.position(35, 8);

	// Take Y Size.
    let inputYSize = createInput(160, int);
    inputYSize.size(100, 25);
    inputYSize.position(180, 8);

	// Take Cell Size.
    let inputCellSize = createInput(3, int);
    inputCellSize.size(100, 25);
    inputCellSize.position(360, 8);

	// Take Number of Ants.
    let inputAntsAmount = createInput(10, int);
    inputAntsAmount.size(100, 25);
    inputAntsAmount.position(610, 8);

	// Generate cave.
    let simulateButton = createButton('Simulate!');
    simulateButton.size(100, 32);
    simulateButton.position(750, 8);
    simulateButton.mousePressed(function()
    {
		clear();

		UpdateInputs();
		createCanvas(XSize * CellSize + (Offset * 2), YSize * CellSize + (Offset * 2)); // Resize canvas.

		inputXSize.remove();
		inputYSize.remove();
		inputCellSize.remove();
		inputAntsAmount.remove();
		simulateButton.remove();

		Init();
	
		Simulate = true;

		// Spawn ants.
		for (let i = 0; i < StartingAntsAmount; i++)
			Ants.push(new Ant(Nest[Math.floor(Math.random() * Nest.length)], Math.floor(Math.random() * 8)));

		function UpdateInputs()
		{
			XSize = Number(inputXSize.value());
			YSize = Number(inputYSize.value());
			CellSize = Number(inputCellSize.value());
			StartingAntsAmount = Number(inputAntsAmount.value());
		}
    });
}
/* #endregion */

/* #region Ants */
function SpawnNewAnts()
{
	if (NestFood >= 5)
	{
		Ants.push(new Ant(Nest[Math.floor(Math.random() * Nest.length)], Math.floor(Math.random() * 8)));
		NestFood -= 5;
	}
}

function SimulateAnts()
{
	AntWithFood = 0;

	for (let ant of Ants)
	{
		if (ant.state == AntState.SEEKER) // If ant is seeking food.
		{
			PheromonePath.add(ant.cell); // Store current ant tile as path to home.

			let forwardTiles = GetForwardTiles(ant); // Get the three tiles in front of the ant.
			ant.SearchFood(forwardTiles); // Choose the best tile to go to.
		}
		else if (ant.homePath.length > 0) // If ant is returning home.
		{
			// If ant is returning with food.
			if (ant.state == AntState.RETURNER)
			{
				PheromonePath.add(ant.cell); // Store current ant tile as path to food.
				AntWithFood++; // Increment the amount of ants with food.
			}

			ant.ReturnHome(); // Take one step back home.
		}
		else
		{
			if (ant.state == AntState.RETURNER) // Increment nest food if ant brought back food.
				NestFood++;
	
			ant.steps = ant.stepsLimit; // Reset ant step limit.
			ant.LookForPheromone(Cells); // Look for the strongest phermone trail and turn towards it.
			ant.state = AntState.SEEKER; // Set ant state to seeker.
		}

		// Draw the ant.
		ant.DrawAnt(CellSize, Offset);
	}
}

// Gets 3 tiles in front of the ant.
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

		// Remove nest and occupied tiles from the list.
		for (let tile of forwardTiles)
		{
			if (tile.nest || tile.occupied)
			{
				let cellIndex = forwardTiles.indexOf(tile);
	
				forwardTiles.splice(cellIndex, 1);
			}
		}

		if (forwardTiles.length == 0)
		{
			ant.Rotate();
			forwardTiles = [];
		}
	}
	
	return forwardTiles;
}
/* #endregion */

/* #region Food */
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
/* #endregion */

/* #region Nest */
function SpawnNest(_nestStartX, _nestStartY, _nestSize)
{
	for (let y = _nestStartY; y < _nestStartY + _nestSize; y++)
	{
		for (let x = _nestStartX; x < _nestStartX + _nestSize; x++)
		{
			if (y == _nestStartY || y == (_nestStartY + _nestSize) - 1 || x == _nestStartX || x == (_nestStartX + _nestSize) - 1) // Draw the outline of the nest.
			{
				Cells[y][x].nest = true;
				Nest.push(Cells[y][x]);
			}
			else // We're using a little trick here. The inside of the nest is marked as occupied so the ants don't step in there. This way they will always move out of the nest.
			{
				Nest.push(Cells[y][x]);
				Cells[y][x].occupied = true;
			}
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
/* #endregion */

function DrawPheromoneTrail()
{
	for (let cell of PheromonePath)
	{
		if (cell.pheromone > 0)
		{
			fill(255, 0, 0, cell.pheromone * 255);
			square(cell.x * CellSize + Offset, cell.y * CellSize + Offset, CellSize);
			
			cell.UpdatePheromone();
		}
		else if (cell.pathToHome > 0)
		{
			fill(0, 0, 255, cell.pathToHome * 50);
			square(cell.x * CellSize + Offset, cell.y * CellSize + Offset, CellSize);
		}
		else
		{
			PheromonePath.delete(cell);
		}
	}
}