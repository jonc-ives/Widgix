exports.WidgetInFocus = class {
	
	constructor(key, widget) {
		this.key = key;
		this.obj = widget;
		this.wdBody = null;
		this.hnodes = [];
		this.focus = null;
	}

	append_tree_panes(tree) {

	}

	build_widget_body() {
		this.wdBody = document.createElement("div");
		this.wdBody.id = this.key;
		this.wdBody.className = "wd-edt-body";
		this.wdBody.style.width = this.obj["width"] ? this.obj["width"] : "auto";
		this.wdBody.style.height = this.obj["height"] ? this.obj["height"] : "auto";
		
		for (var n in this.obj["hnodes"]) {
			var newChildNode = new ChildNode(this.obj["hnodes"][n]);
			this.hnodes.push(newChildNode);
			this.wdBody.appendChild(newChildNode.element);
			// bind the element to the focus here, so we can manage it here.
			console.log("binding object");
			newChildNode.onclick = (event) => {
				console.log("focusing from", this.focus, event.target);
				// if element is focused, do nothing
				if (this.focus === event.target) return;
				// we'll be unfocusing now
				this.unfocus_element();
				// if another element is in focus, do nothing more
				if (this.focus) return;
				// if no elements are focused, focus this one
				this.focus = event.target;
				// show focused border
				// show resizer corner buttons
				// load tree settings options
				// bind to drag-movement
			};

		}

		return this.wdBody;
	}
};

class ChildNode {

	// receives an hnode object
	// breaks inline styling into separate components
	// creates id for future referencing
	// creates resizing balls and border, bound for click/drag
	// binds click to object focus
	// builds and catalogs child nodes recursively
	constructor(object) {
		this.element = null;
		this.inline = {};
		this.hnodes = [];
		this.focused = false;

		this.split_inline_styles(object["inline"]);
		this.classes = object["class"].split(" ");
		this.build_hnode_element(object);

		// this.build_resize_border();
		// this.bind_hnode_to_focus();

		for (var hn in object["hnodes"]) {
			var newChildNode = new ChildNode(object["hnodes"][hn]);
			this.hnodes.push(newChildNode);
			this.element.appendChild(newChildNode.element);
		}
	}

	split_inline_styles(inline) {
		if (!inline) return;
		var split = inline.split(";");
		for (var i in split) {
			var key = inline[i].split(":")[0];
			var value = split[i].split(":")[1];
			this.inline[key] = value;
		}
	}

	build_hnode_element(obj) {
		this.element = document.createElement(obj["type"]);
		this.element.id = obj["ident"];
		this.element.className = obj["class"] + "";
		this.element.innerHTML = (obj["text"] ? obj["text"] : "");
		this.element.style = obj["inline"];
	}

	// build_resize_border() {

	// }
}

// unset drag for canvas and elements
unsetDragElement = function(element) {
	element.onmousedown = null;
};

// for normal drag elements
setDragElement = function(element) {
	var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
	element.onmousedown = (event) => {
		event.preventDefault();
		pos3 = event.clientX;
		pos4 = event.clientY;
		document.onmouseup = (event) => {
			console.log("drag finished");
			document.onmouseup = null;
			document.onmousemove = null;
		}; document.onmousemove = (event) => {
			event.preventDefault();
			pos1 = pos3 - event.clientX;
			pos2 = pos4 - event.clientY;
			pos3 = event.clientX;
			pos4 = event.clientY;
			element.style.top = (element.offsetTop - pos2) + "px";
			element.style.left = (element.offsetLeft - pos1) + "px";
		};
	};
};
