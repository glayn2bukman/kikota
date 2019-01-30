var FIXTURES = [];
var ODDS = [];
var MAX_FIXTURES = 4;

var COUNTER = 1;
var COMPUTED = false;
var RESULTS_DIVS = [];

function scroll_to_bottom(div_id)
{
    var div = document.getElementById(div_id);
    div.scrollTop = div.scrollHeight;
}

function human_readable(value, dp)
{
    try{
        value/2.3;
        
        if (!isNaN(dp))
            value = value.toFixed(dp);
        else
            value = value.toString();
    }
    catch(e){
        // value already a string as we want it!
    }
    
    if (isNaN(parseFloat(value)))
    {
        console.log("value <",value,"> not a stringified number!");
        return value;
    }

    dp_index = value.indexOf(".");
    dp_index = dp_index<0 ? value.length-1 : dp_index-1;
        
        // array to contain new human-readable value format...
    value_reverse = [];
    for (var i=value.length-1; i!=dp_index; --i)
        value_reverse.push(value[i]);
    
    for (var i=dp_index, counter=1; i>=0; --i)
    {
        value_reverse.push(value[i]);
        if (counter==3 && i)
        {
            value_reverse.push(",");
            counter = 0;
        }

        counter++;
    }

    value_reverse.reverse();

    if (!isNaN(dp) && !dp)
    {
        value = value_reverse.join("");
        if (value.indexOf(".")>=0)
            return value.slice(0, value.indexOf("."));
    }
    
    return value_reverse.join("");

    
}

function flag_error(error)
{
    swal({
        title: "Error!",
        text: error,
        type: "error",
        confirmButtonText: "Ok"
    });
}

function show_info(msg)
{
    swal({
        title: "Info!",
        text:msg,
        type: "info",
        confirmButtonText: "Ok"
    });
}

function show_success(msg)
{
    swal({
        title: "Info!",
        text:msg,
        type: "success",
        confirmButtonText: "Ok"
    });
}

function add_fixture(){
	if(FIXTURES.length>=MAX_FIXTURES){
		flag_error("sorry, a maximum of "+MAX_FIXTURES+" fixtures is allowed!");
		return;
	}

    var team1=document.getElementById("team1").value;
    var team2=document.getElementById("team2").value;

    if(!team1.length){flag_error("team A?");return;}
    if(!team2.length){flag_error("team B?");return;}

    var oddW=document.getElementById("oddW").value;
    var oddX=document.getElementById("oddX").value;
    var oddL=document.getElementById("oddL").value;

    oddW = parseFloat(oddW);
    oddX = parseFloat(oddX);
    oddL = parseFloat(oddL);

    if(isNaN(oddW) || !oddW){flag_error("odd W?");return;}
    if(isNaN(oddX) || !oddX){flag_error("odd X?");return;}
    if(isNaN(oddL) || !oddX){flag_error(team2+"odd W?");return;}


    var mum = document.getElementById("fixtures_div");
    var fixture = document.createElement("div");
    
    fixture.setAttribute("class","fixture");
        var tA = document.createElement("span");
        tA.style.width="40%";
        tA.style.textIndent = "5px";
        tA.innerHTML = team1;

        var tX = document.createElement("span");
        tX.style.width="20%";
        tX.style.textAlign = "center";
        tX.innerHTML = "X";

        var tB = document.createElement("span");
        tB.style.width="40%";
        tB.style.textAlign = "right";
        tB.style.marginRight="5px"
        tB.innerHTML = team2;
    
        fixture.appendChild(tA);
        fixture.appendChild(tX);
        fixture.appendChild(tB);
    
    mum.appendChild(fixture);

    var odds = document.createElement("div");
    odds.style.color = "green";
    odds.style.borderBottom="1px solid green";
    odds.style.fontWeight="bold";
    
    odds.setAttribute("class","fixture");
        var tAo = document.createElement("span");
        tAo.style.width="40%";
        tAo.style.textIndent = "5px";
        tAo.innerHTML = oddW;

        var tXo = document.createElement("span");
        tXo.style.width="20%";
        tXo.style.textAlign = "center";
        tXo.style.color = "red";
        tXo.innerHTML = oddX;

        var tBo = document.createElement("span");
        tBo.style.width="40%";
        tBo.style.textAlign = "right";
        tBo.style.marginRight="5px"
        tBo.innerHTML = oddL;
    
        odds.appendChild(tAo);
        odds.appendChild(tXo);
        odds.appendChild(tBo);
    
    mum.appendChild(odds);

    document.getElementById("team1").value=""; document.getElementById("team2").value="";
    document.getElementById("oddW").value=""; document.getElementById("oddX").value=""; document.getElementById("oddL").value="";

	FIXTURES.push([team1,team2]);
	ODDS.push([oddW,oddX,oddL]);

	COUNTER = 0;
	COMPUTED = false;
}

function clear(el_id){
	el = document.getElementById(el_id);
	while(el.childNodes.length){
		el.removeChild(el.childNodes[0]);
	}
}	

function start_computing(){
	if(!ODDS.length){
		flag_error("please add atleast 1 fixture!");
		return;
	}
	if(ODDS.length<2){
		flag_error("please add atleast 2 fixtures!");
		return;
	}

	var divs = document.getElementsByClassName('_reset');
	for(var i=0; i<divs.length; ++i){
		divs[i].disabled = true;
	}

    document.getElementById("teams_div").children[0].style.display="none";

    RESULTS_DIVS = [];
    COUNTER = 1
	for(var i=0; i<ODDS[0].length; ++i){
		get_odd(ODDS[0][i], ODDS.slice(1,ODDS.length),[i]);
	}

    RESULTS_DIVS[0].style.display = "block";

    document.getElementById("next").innerHTML = RESULTS_DIVS.length-1;
    document.getElementById("back").innerHTML = "0";

    COMPUTED = true;

}

function reset(){
	FIXTURES = [];
	ODDS = [];
	COUNTER = 1;
	COMPUTED = false;
    RESULTS_DIVS = [];

    clear("teams_div");
    var fixtures_div = document.createElement("div");
    fixtures_div.setAttribute("id","fixtures_div");
    fixtures_div.setAttribute("class","teams_div");
    document.getElementById("teams_div").appendChild(fixtures_div);

    document.getElementById("next").innerHTML = "0";
    document.getElementById("back").innerHTML = "0";

	var divs = document.getElementsByClassName('_reset');
	for(var i=0; i<divs.length; ++i){
		divs[i].disabled = false;
	}

}

function get_odd(odd,arr,path){
    if(arr.length>1){
        var _path;
		for(var i=0; i<arr[0].length; ++i){
			_path = path.slice(0,path.length); // craete array copy. similar to python's lst[:]
            _path.push(i);
			get_odd(odd*arr[0][i],arr.slice(1,arr.length),_path);
		}
	}else{
		arr = arr[0];
        var pushed = false;

        var fixture,odds,_odd;
        
        var mum;
        
        var teams_div = document.getElementById("teams_div");

		for(var i=0; i<arr.length; ++i){
			if(!pushed) {path.push(i);pushed=true;}
            else{path[path.length-1]=i}

            _res = ""

            mum = document.createElement("div");
            mum.setAttribute("class","teams_div");
            mum.style.display = "none";

            for(var j=0; j<path.length; ++j){
                
                fixture = document.createElement("div");
                
                fixture.setAttribute("class","fixture");
                    var tA = document.createElement("span");
                    tA.style.width="40%";
                    tA.style.textIndent = "5px";
                    tA.innerHTML = FIXTURES[j][0];

                    var tX = document.createElement("span");
                    tX.style.width="20%";
                    tX.style.textAlign = "center";
                    tX.innerHTML = "X";

                    var tB = document.createElement("span");
                    tB.style.width="40%";
                    tB.style.textAlign = "right";
                    tB.style.marginRight="5px"
                    tB.innerHTML = FIXTURES[j][1];
                
                    fixture.appendChild(tA);
                    fixture.appendChild(tX);
                    fixture.appendChild(tB);
                
                mum.appendChild(fixture);

                odds = document.createElement("div");
                odds.style.color = "green";
                odds.style.borderBottom="1px solid green";
                odds.style.fontWeight="bold";
                
                odds.setAttribute("class","fixture");
                    var tAo = document.createElement("span");
                    tAo.style.width="40%";
                    tAo.style.textIndent = "5px";
                    //tAo.innerHTML = oddW;

                    var tXo = document.createElement("span");
                    tXo.style.width="20%";
                    tXo.style.textAlign = "center";
                    tXo.style.color = "red";
                    //tXo.innerHTML = oddX;

                    var tBo = document.createElement("span");
                    tBo.style.width="40%";
                    tBo.style.textAlign = "right";
                    tBo.style.marginRight="5px"
                    //tBo.innerHTML = oddL;
                
                    odds.appendChild(tAo);
                    odds.appendChild(tXo);
                    odds.appendChild(tBo);
                
                    if(path[j]==0){tAo.innerHTML="W"}
                    else if(path[j]==1){tXo.innerHTML="X"}
                    else if(path[j]==2){tBo.innerHTML="W"}

                mum.appendChild(odds);

            }

            _odd = document.createElement("span");
            _odd.setAttribute("class","odd");
            _odd.innerHTML = "Odd: "+odd*arr[i];

            mum.appendChild(_odd);

            RESULTS_DIVS.push(mum);

            teams_div.appendChild(mum);
		}
	}
}

function next(){
    if(!COMPUTED) {return;}
    if(COUNTER==RESULTS_DIVS.length){return;}

    RESULTS_DIVS[COUNTER-1].style.display = "none";
    RESULTS_DIVS[COUNTER].style.display = "block";
    ++COUNTER;

    document.getElementById("next").innerHTML = parseInt(document.getElementById("next").innerHTML)-1;
    document.getElementById("back").innerHTML = parseInt(document.getElementById("back").innerHTML)+1;
}

function back(){
    if(!COMPUTED) {return;}
    if(COUNTER==1){return;}

    RESULTS_DIVS[COUNTER-1].style.display = "none";
    RESULTS_DIVS[COUNTER-2].style.display = "block";
    --COUNTER;

    document.getElementById("next").innerHTML = parseInt(document.getElementById("next").innerHTML)+1;
    document.getElementById("back").innerHTML = parseInt(document.getElementById("back").innerHTML)-1;

}

window.onload = function(){
/*
	var d = [
		[1,2,3],
		[4,5,6],
		//[1,2,3],
		//[9.12,9.12,9.22],
	];

    FIXTURES = [["Man U","Arsenal"],["Chelsea","Tottenham"],["Barcelona","Madrid"],["QPR","Wigan"]];
    RESULTS_DIVS = [];
    COUNTER = 1
	for(var i=0; i<d[0].length; ++i){
		get_odd(d[0][i], d.slice(1,d.length),[i]);
	}

    RESULTS_DIVS[0].style.display = "block";

    document.getElementById("next").innerHTML = RESULTS_DIVS.length-1;
    document.getElementById("back").innerHTML = "0";

    COMPUTED = true;
*/
}