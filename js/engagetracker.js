/* Section View Tracker v1.0 : by Terrill Couther */

var engagementTracker = function() {
	var thus = this;
	var evtEngage, evtUngage, scrollTimer = null;

	this.sectionIdentifier = "data-engagement-id";
	this.sectionOffseter = "data-engagement-offset";
	this.currentEl = null;
	this.currentId = null;
	this.sectionQuery = null;
	this.sectionElems = null;
	this.sectionLengt = null;
	this.callbacks = {};
	this.sectionPosns = [];
	
	// HANDLERS ////////////////////////////////////////////////////
	this.handleEngage = function(evt,cb) {
		var callback = cb || function(){};
		var item = evt.target;
		item.isEngaged = true;
		item.countEngage = (item.countEngage) ? item.countEngage+1 : 1;
		item.setAttribute('engaged','true');
		item.setAttribute('engage','true');
		thus.setCurrentSection(item);
		callback();
	};
	this.handleUngage = function(evt) {
		var item = evt.target;
		item.setAttribute('engage','false');
	};

	// GETTERS ////////////////////////////////////////////////////
	this.getSectionPositions = function() {
		var positions = [];
		function mapPositions(item) {
			positions.push(item.offsetTop);
		}
		thus.sectionElems.map(mapPositions);
		return positions;
	};
	this.getCurrentSection = function() {
		return {
			id : thus.currentId,
			el : thus.currentEl
		};
	};

	// SETTERS ////////////////////////////////////////////////////
	this.setEngagedSection = function() {
		function inView(el) {
			var eloffsetOption = el.getAttribute(thus.sectionOffseter) || 4.5;
			var eloffset = el.offsetHeight / parseInt(eloffsetOption);
			var elinfo = { "top":el.offsetTop + eloffset, "height":el.offsetHeight - (eloffset*2) };
			
		    if (elinfo.top + elinfo.height < window.pageYOffset || elinfo.top > window.pageYOffset + window.innerHeight) {
		        return false;
		    } else {
		        return true;
		    }
		}
		function mapEngaged(item) {
			if ( inView(item) ) {
				item.dispatchEvent(evtEngage);
			} else {
				if ( item.countEngage && item.countEngage > 0 ) {
					item.dispatchEvent(evtUngage);
				}
			}
		}
		thus.sectionElems.map(mapEngaged);
	};
	this.setCurrentSection = function(el) {
		thus.currentId = el.getAttribute(thus.sectionIdentifier);
		thus.currentEl = el;
	};
	this.setEvents = function() {
		evtEngage = new CustomEvent('onEngaged', {});
		evtUngage = new CustomEvent('onUngaged', {});

		function mapEventsToElems(item) {
			item.addEventListener("onEngaged",thus.handleEngage,false);
			item.addEventListener("onUngaged",thus.handleUngage,false);
		}
		thus.sectionElems.map(mapEventsToElems);

		document.onscroll = function(){
			if (scrollTimer) window.clearTimeout(scrollTimer);
			scrollTimer = window.setTimeout(function(){
				thus.setEngagedSection();
			},500);
		};
	};
	this.setCallbacks = function() {
		function mapCallbacks(item) {
			var itemCallbacks = {}, 
				itemid = item.getAttribute(thus.sectionIdentifier);
			if (thus.callbacks && itemid && thus.callbacks[itemid]) {
				itemCallbacks = thus.callbacks[itemid];
				for (x in itemCallbacks) {
					item.addEventListener(x, itemCallbacks[x], false);
				}
			}
		}
		thus.sectionElems.map(mapCallbacks);
	};
	this.setSections = function() {
		thus.sectionQuery = thus.sectionQuery || document.querySelectorAll("["+thus.sectionIdentifier+"]");
		thus.sectionElems = ( Array.isArray(thus.sectionQuery) ) ? thus.sectionQuery : Array.prototype.slice.call(thus.sectionQuery);
		thus.sectionLengt = thus.sectionElems.length;
		thus.sectionPosns = thus.getSectionPositions();
	};

	// INIT ////////////////////////////////////////////////////
	this.init = function() {
		thus.setSections();
		thus.setEvents();
		thus.setCallbacks();
		thus.setEngagedSection();
	};
}