/*
Your assignment is to implement the following functionality:
	* remove a file
		"rm" <file name>
		> rm hello.txt
			entirely delete the file hello.txt

	* find and replace a word in the file
		"replace" <file to search> <word to replace> <replacement word>
		> replace hello.txt hello goodbye
			replace all instances of hello in hello.txt with goodbye
		> replace what.txt there their
			replace all instances of there in what.txt with their

	* find a line in a file
		"grep" <file name> <word to find>
		> grep hello.txt hello
			print out all of the lines in hello.txt that contain "hello"
		> grep what.txt there
			print out all of the lines in what.txt that contain "there"

	Bonus work:
		* Ask for confirmation before deleting a file
		* Don't let people delete files that are above the current working directory (i.e. disallow "../")
		* Have grep take a regular expression as the word to find
		* Create mkdir and rmdir
*/


var fs = require('fs');

var confirm = {
	waiting: false,
	func: function(){},
	input: ''
};

var useStdin = function() {
	var input = process.stdin.read();
	
	// Check if waiting to confirm command
	// * Ask for confirmation before deleting a file
	if(confirm.waiting) {
		// Trim the confermation response
		var response = input.toString().trim();
		// If the response is yes...
		if(response === 'yes'){
			// Run the function with given input
			response.func(confirm.input);
		} else {
			// Display error message
			console.log('Aborting doto non comfirmation')
		}
		// Exit confirm state
		confirm.waiting = false;
	}


	if (input !== null) {
		var inputSplit = input.toString().trim().split(" ");
		if (inputSplit[0] == "cat") {
			//cat <filename>
			catFile(inputSplit[1]);
		} else if (inputSplit[0] == "touch") {
			//touch <filename>
			createNewFile(inputSplit[1]);
		} else if (inputSplit[0] == "rm") {
			//rm <file name>
			if(inputSplit[1].slice(0,3) != '../'){
				// Initialize confirm prompt
				console.log("Are you sure? Type 'yes' to continue");
				// Set function to be confirmed
				confirm.func = removeFile;
				// Set input of that function
				confirm.input = inputSplit[1]
				// Enter confirmation waiting state
				confirm.waiting = true;			
			} else {
				console.log("Cannot remove file above working directory");
			}
		} else if (inputSplit[0] == "replace") {
			//touch <filename>
			findAndReplace(inputSplit[1], inputSplit[2], inputSplit[3]);
		} else if (inputSplit[0] == "grep") {
			//touch <filename>
			grep(inputSplit[1],inputSplit[2]);
		}
	}

};

//create a file (touch)
function createNewFile(fileName) {
	fs.writeFile(fileName, "", function(err){
		if (err) {
			console.log("Could not write to file");
		} else {
			console.log("File created and saved");
		}
	});
}

//read from a file (cat)
function catFile(fileName) {
	fs.readFile(fileName, function(err, data) {
		if (err) {
			console.log("Unable to read from file");
		} else {
			console.log(data.toString());
			return data.toString();
		}
	});
}


// * remove a file
function removeFile(fileName){
	fs.unlink(fileName, function(err){
		if (err) {
			console.log("Unable to find file to delete");
		} else {
			console.log(fileName + " has been deleted");
		}
	});
}

// * find and replace a word in the file
function findAndReplace(fileName, word, replacement){
	fs.readFile(fileName, function(err, data){
		if (err) {
			console.log("Unable to find file");
		} else {
			data = data.toString().split(' ');

			for(var i in data){
				if(data[i] === word){
					data[i] = replacement;
				}
			}
			
			fs.writeFile(fileName, data.join(' '), function(err){
				if (err) {
					console.log("Could not write to file");
				} else {
					console.log("Words have been replaced");
				}
			});
		}
	});
}

// * find a line in a file
function grep(fileName, target){
	fs.readFile(fileName, function(err, data) {
		// array to store lines that should be printed
		var linesToPrint = [];
		// initialize output array
		var output = [];
		// initialize object to store a possible pattern
		var pattern;

		// Catch errors
		if (err) {
			// Display error message
			console.log("Couldn't find file");
		} else {
			// set lines to correspond with lines of text stored in data
			var lines = data.toString().split('\n');
			// initialize words storage
			var words = []; 

			// * Have grep take a regular expression as the word to find
			// Check if first and last or secound to last are back slashes...
			if (target[0] == '/' && (target[target.length-1] == '/' || target[target.length-2] == '/')){
				// In the case of a flag
				if(target[target.length-2] == '/'){
					// set regex pattern a flag to input
					pattern = new RegExp(target.slice(1,target.length-2),target.slice(target.length-1));
				}
				else {
					// set regex pattern to input
					pattern = new RegExp(target.slice(1,target.length-1));
				}
			}
				
			// Loop through lines
			for(var i in lines){
				var addLine = false;
				// Check if a patern was provided...
				if(pattern){
					// If there was a patern match
					if(lines[i].search(pattern) >= 0){
						// add the line
						addLine = true;
					}
				} else {
					// Loop through words within lines
					for(var word of lines[i].split(' ')){
						// if the word matches the target word...
						if(word === target){
							// add the line
							addLine = true;
						}
					}
				}
				// loop through line numbers stored in lines to be printed
				for(var lineNum of linesToPrint){
					// If this line number is already stored
					if(lineNum == i){
						// dont add it
						addLine = false;
					}
				}
				// If you still should add the line
				if(addLine){
					// add the line number to the array of lines to be printed
					linesToPrint.push(i);
				}
			}

			// loop through the line numbers
			for(var lineIndex of linesToPrint){
				// set the output to consist of only lines which contain the target word or pattern
				output.push(lines[lineIndex]);
			}

			// print the output
			console.log(output.join('\n'));
		}
	});
}

// don't initialy wait for conformation
var awaitingConf = false;

// handle input
process.stdin.on('readable', useStdin);



