var sqTurns = []; //turns each sidequest takes
var sqPos = [0, 0, 0, 64, 192, 458]; //position of all sidequests
var sqPosNuns = [0, 0, 0, 0, 64, 458]; //sq positions frat side with nuns trick

//making an array of all 64 possible sidequest combinations as arrays
var boolCombs = [];
for (var i = 0; i < 64; i++) {
  var temp = [];
  var num = i;
  for (var j = 5; j >= 0; j--) {
    if (num >= Math.pow(2, j)) {
      temp[j] = true;
      num -= Math.pow(2, j);
    } else {
      temp[j] = false;
    }
  }
  boolCombs.push(temp);
}

var Calculator = {};
Calculator.sqPos = [];
Calculator.sqTurns = [0,0,0,0,0,0]; //to be safe

//given an array of turncounts, add them together
Calculator.addTurns = function(arr) {
  var total = 0;
  for (var i = 0; i < arr.length; i++) {
    total += arr[i];
  }
  return total;
};

//given an array of 6 booleans, return an array of sidequest positions
Calculator.getSQPos = function(arr) {
  var result = [];
  for (var i = 0; i < arr.length; i++) {
    if (arr[i]) {
      result.push(Calculator.sqPos[i]);
    }
  }
  return result;
};

//given an array of 6 booleans, return an array of sidequest turncounts
Calculator.getSQturns = function(arr) {
  var result = [];
  for (var i = 0; i < arr.length; i++) {
    if (arr[i]) {
      result.push(Calculator.sqTurns[i]);
    }
  }
  return result;
};

//given an array of sidequest positions, calculate turns to complete battlefield
//array must be in order
Calculator.addBFTurns = function(arr) {
  var kills = 0;
  var turns = 0;
  var kpt = 1; //kills per turn
  var index = 0; //points to array index of the next sidequest
  while (kills < 1000) {
    //if the next sq is available and you're not on the last sq, do sidequests
    while (kills >= arr[index] && index < arr.length) {
      kpt = kpt * 2;
      index += 1;
    }

    //kill on the battlefield
    turns += 1;
    kills += kpt;
  }
  return turns;
};

//given an array of booleans, calculate total turns to complete the quest
Calculator.calcTotalTurns = function(arr) {
  var SQ = Calculator.addTurns(Calculator.getSQturns(arr));
  var BF = Calculator.addBFTurns(Calculator.getSQPos(arr));
  return [SQ, BF];
}

Calculator.getBestTurns = function() {
  var shortest = 1000;
  var bestCombo = [];
  var bestArr = [];
  for (var k = 0; k < boolCombs.length; k++) {
    var turnsArr = Calculator.calcTotalTurns(boolCombs[k]);
    var turncount = turnsArr[0] + turnsArr[1];
    if (turncount < shortest) {
      shortest = turncount;
      bestArr = turnsArr;
      bestCombo = boolCombs[k];
    }
  }
  return [bestArr, bestCombo];
}

//nuns is a boolean
Calculator.getBestFrat = function(nuns) {
	Calculator.sqPos = sqPos; //positions
	Calculator.sqTurns = sqTurns; //turncounts
	if (nuns) {
  	Calculator.sqPos = sqPosNuns; //bc nuns go in front of orchard
    //switch sqTurns[3] with sqTurns[4];
    var temp = Calculator.sqTurns[3];
    Calculator.sqTurns[3] = Calculator.sqTurns[4];
    Calculator.sqTurns[4] = temp;
  }
	return Calculator.getBestTurns();
}

Calculator.getBestHippie = function() {
	Calculator.sqPos = sqPos;
	Calculator.sqTurns = sqTurns; //turncounts
  Calculator.sqTurns.reverse(); //bc hippie sqs go the other way
  
  return Calculator.getBestTurns();
}

//sidequest calculator time
var SQCalc = {};

//helper function
function isValidTurnCount(input) {
  if (!input || isNaN(input)) return false; //check if not a number
  if (input % 1 !== 0) return false; //check if not a whole number
  if (input < 0 || input > 1000) return false; //check if too big or small
  return true;
}

var SQNamesFrat = ["Arena", "Junkyard", "Lighthouse", "Orchard", "Nuns", "Farm"];
var SQNamesNuns = ["Arena", "Junkyard", "Lighthouse", "Nuns", "Orchard", "Farm"];
var SQNamesHippie = ["Farm","Orchard","Nuns","Lighthouse","Junkyard","Arena"];
//formats boolean array into string of names
function getSQNames(arr, hippie, trick) {
	var names = [];
  var temp = [];
  if (trick) {names = SQNamesNuns;}
  else {names = SQNamesFrat;}
  
  if (hippie) {names = SQNamesHippie;}
  
  for (var i=0; i<arr.length; i++) {
  	if(arr[i]) {temp.push(names[i]);}
  }
  
  return temp.join(', ');
}

//int, int, string
function getResultString(sq, bf, names) {
	var total = sq + bf;
	//return "Sidequests: " + sq + " Battlefield: " + bf + "   " + names;
  return "Sidequests: " + names + '<br/>' + total + " turns (Sidequests: " + sq + " Battlefield: " + bf + ")";
}


$(document).ready(function() {
  //$('#bf').html("Battlefield turns: " + Calculator.addBFTurns(sqPos));

  $('#calculate').on('click', function() {
    for (var n = 0; n < 6; n++) {
      var inputTurns = $('#sq').children('input').eq(n).val(); //get nth child
      if (!isValidTurnCount(inputTurns)) { //sanitize
        $('#sq').children('input').eq(n).val(0); //displaying 0
        inputTurns = 0; //make it 0
      }
      sqTurns[n] = parseInt(inputTurns); //fill an array of sidequest turns
    }
    var nunsTrick = $('#nuns').is(':checked');
    
    //now comes the calculatin part
    var frat = Calculator.getBestFrat(nunsTrick);
    var hippie = Calculator.getBestHippie();
    
    var fratStr = getResultString(frat[0][0],frat[0][1],getSQNames(frat[1],false,nunsTrick));
    var hippieStr = getResultString(hippie[0][0],hippie[0][1],getSQNames(hippie[1],true,false));
    
    if ((frat[0][0]+frat[0][1]) <= (hippie[0][0]+hippie[0][1])) {
    	$('#result').html('Do Frat Orcs <br/>' + fratStr);
      $('#second').html('Best Hippie:<br/>' + hippieStr);
    } else {
    	$('#result').html('Do Hippies <br/>' + hippieStr);
      $('#second').html('Best Frat Orc:<br/>' + fratStr);
    }
    

  });
});
