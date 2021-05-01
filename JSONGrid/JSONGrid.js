"use strict";
var DOMHelper = {
    EXPANDER_TARGET_ATTRIBUTE: "data-target-id",
    TABLE_SHRINKED_CLASSNAME: "shrinked",
    JSON_GRID_CONTAINER_CLASSNAME: "json-grid-container",
    JSON_GRID_ELEMENT_CONTAINER_CLASSNAME: "json-grid-element-container",
    createElement: function(e, t, r, n) {
        e = document.createElement(e), r = r || [];
        return Array.isArray(r) || (r = [r]), t && r.push(t), DOMTokenList.prototype.add.apply(e.classList, r), n && (e.id = n), e
    },
    createExpander: function(e, t) {
        var r = DOMHelper.createElement("span", "expander");
        return r.textContent = "[" + DOMHelper.getExpanderSign(t) + "] " + e + " items", r.setAttribute(DOMHelper.EXPANDER_TARGET_ATTRIBUTE, t.id), r.onclick = DOMHelper.onExpanderClick, r
    },
    onExpanderClick: function(e) {
        var t = e.target.getAttribute(DOMHelper.EXPANDER_TARGET_ATTRIBUTE),
            t = document.getElementById(t);
        t && (t.classList.toggle(DOMHelper.TABLE_SHRINKED_CLASSNAME), e.target.textContent = "[" + DOMHelper.getExpanderSign(t) + e.target.textContent.slice(2))
    },
    getExpanderSign: function(e) {
        return e.classList.contains(DOMHelper.TABLE_SHRINKED_CLASSNAME) ? "+" : "-"
    }
};

function JSONGrid(e, t) {
    this.data = e, this.container = t instanceof HTMLElement ? t : null, this.instanceNumber = JSONGrid.instances || 0, JSONGrid.instances = (JSONGrid.instances || 0) + 1
}
JSONGrid.prototype.processArray = function() {
    var r = (r = this.data.reduce(function(e, t) {
            t = Object.keys(t);
            return e.concat(t)
        }, [])).filter(function(e, t) {
            return r.indexOf(e) === t
        }),
        n = DOMHelper.createElement("tr");
    n.appendChild(DOMHelper.createElement("th")), r.forEach(function(e) {
        var t = DOMHelper.createElement("th");
        t.textContent = e.toString(), n.appendChild(t)
    });
    var e = this.data.map(function(n, e) {
        var a = DOMHelper.createElement("tr"),
            t = DOMHelper.createElement("td", typeof e);
        return t.appendChild(new JSONGrid(e).generateDOM()), a.appendChild(t), r.forEach(function(e, t) {
            var r = DOMHelper.createElement("td", typeof n, "table-wrapper"),
                e = void 0 === n[e] || null === n[e] ? "" + n[e] : n[e];
            r.appendChild(new JSONGrid(e).generateDOM()), a.appendChild(r)
        }), a
    });
    return {
        headers: [n],
        rows: e
    }
}, JSONGrid.prototype.processObject = function() {
    var e = Object.keys(this.data),
        r = DOMHelper.createElement("tr");
    e.forEach(function(e) {
        var t = DOMHelper.createElement("td");
        t.textContent = "" + e, r.appendChild(t)
    });
    var d = this;
    return {
        headers: [],
        rows: e.map(function(e, t) {
            var r, n = DOMHelper.createElement("tr"),
                a = DOMHelper.createElement("td", "string", "rowName"),
                i = d.data[e],
                p = typeof i;
            "object" == p && i ? r = new JSONGrid(i).generateDOM() : (r = DOMHelper.createElement("span", p, "value")).textContent = "" + i;
            p = DOMHelper.createElement("td", p);
            return a.textContent = e, p.appendChild(r), n.appendChild(a), n.appendChild(p), n
        })
    }
}, JSONGrid.prototype.generateDOM = function() {
    var e;
    if (Array.isArray(this.data)) e = this.processArray();
    else {
        if ("object" != typeof this.data) {
            var t = DOMHelper.createElement("span", typeof this.data);
            return t.textContent = "" + this.data, t
        }
        e = this.processObject()
    }
    var r = DOMHelper.createElement("div", DOMHelper.JSON_GRID_ELEMENT_CONTAINER_CLASSNAME),
        n = "table-" + this.instanceNumber,
        t = 0 !== this.instanceNumber ? [DOMHelper.TABLE_SHRINKED_CLASSNAME] : [],
        t = DOMHelper.createElement("table", "table", t, n),
        a = DOMHelper.createElement("tbody"),
        n = DOMHelper.createExpander(e.rows.length, t);
    return r.appendChild(n), e.headers.forEach(function(e) {
        a.appendChild(e)
    }), e.rows.forEach(function(e) {
        a.appendChild(e)
    }), t.appendChild(a), r.appendChild(t), r
}, JSONGrid.prototype.render = function() {
    this.container && this.data && (this.container.innerHTML = "", this.container.appendChild(this.generateDOM()), this.container.classList.add(DOMHelper.JSON_GRID_CONTAINER_CLASSNAME))
}, window.JSONGrid = JSONGrid;