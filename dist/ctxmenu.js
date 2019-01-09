"use strict";
var ContextMenu = /** @class */ (function () {
    function ContextMenu() {
    }
    ContextMenu.attach = function (target, menu) {
        var t = typeof target === "string" ? document.querySelector(target) : target;
        if (t) {
            window.addEventListener("contextmenu", function (e) {
                if (e.target !== t) {
                    return;
                }
                var container = document.createElement("ul");
                menu.forEach(function (item) {
                    var li = document.createElement("li");
                    li.innerHTML = item.text;
                    li.title = item.title || "";
                    container.appendChild(li);
                });
                Object.assign(container.style, {
                    position: "fixed",
                    left: e.offsetX + "px",
                    top: e.offsetY + "px"
                });
                document.body.appendChild(container);
                e.preventDefault();
                setTimeout(function () { return container.remove(); }, 2000);
            });
        }
        else {
            console.error("target element " + target + " not found");
        }
    };
    return ContextMenu;
}());
