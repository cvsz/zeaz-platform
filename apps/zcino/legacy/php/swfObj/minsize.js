/* ============================================================================
* minsize.js, v1.0.001, 2010-04-01
*
* Author:	Scott Park (scott@firefallpro.com)
*
* Desc.:	Defines the minimum size of an element for IE 6 or less
*
* Contents:	minsize()
*
* Requires: Nothing.
*
* http://www.firefallpro.com
*
* Copyright 2010 Firefall Pro, LLC, unless otherwise noted. The contents of
* this file may not be reused, resold or redistributed, in part or in whole,
* without the expressed permission of the respective copyright holders.
* ========================================================================== */

//###############################################################################
//	Description: boolean minsize(string id,int width,int height)
//		Accepts the id of an element as the first argument. Accepts the minimum
//		width followed by the minimum height as the second and third argument.
//
//	Notes: This function should only be conditionally called for IE 6 or less,
//		otherwise use CSS to define min-width & min-height. The function must be
//		called after the element is available, or during the onload event.
//
//	Return Values: Returns a boolean true on success or false on failure.
//###############################################################################
function minsize(id,w,h) {
	var element;
	
	// Validate Input
	if (!id || !w || !h) {
		alert("minsize(): Missing input.");
		return false;
	}
	
	if (!document.getElementById(id)) {
		alert("minsize(): Can't find element with the ID of \""+id+"\".");
		return false;
	} else {
		element = document.getElementById(id);
	}
	
	// Width
	if (element.style.width != "100%") element.style.width = "100%";
	if (element.offsetWidth < w) element.style.width = w+"px";
	
	// Height
	if (element.style.height != "100%") element.style.height = "100%";
	if (element.offsetHeight < h) element.style.height = h+"px";
	
	// Check When Window Resizes
	window.onresize = function() {
		// Width
		if (element.style.width != "100%") element.style.width = "100%";
		if (element.offsetWidth < w) element.style.width = w+"px";

		// Height
		if (element.style.height != "100%") element.style.height = "100%";
		if (element.offsetHeight < h) element.style.height = h+"px";
	}
	
	return true;
}
