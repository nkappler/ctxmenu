export type Rect = {
    x: number,
    y: number,
    width: number,
    height: number,
};

interface Pos {
    x: number;
    y: number;
}

let hdir: "r" | "l" = "r";
let vdir: "u" | "d" = "d";

export function getPos(container: HTMLUListElement, parentOrEvent: HTMLElement | MouseEvent): Pos {
    const rect = getUnmountedBoundingRect(container);
    let pos = { x: 0, y: 0 };
    if (parentOrEvent instanceof Element) {
        const { x, width, y } = getBoundingRect(parentOrEvent);
        pos = {
            x: hdir === "r" ? x + width : x - rect.width,
            y
        };
        if (/* is submenu */ parentOrEvent.className.includes("submenu")) {
            pos.y += (vdir === "d" ? 4 : -12) // add 8px vertical submenu offset: -4px means no vertical movement with default styles
        }
        const savePos = getPosition(rect, pos);
        // change direction when reaching edge of screen
        if (pos.x !== savePos.x) {
            hdir = hdir === "r" ? "l" : "r";
            pos.x = hdir === "r" ? x + width : x - rect.width;
        }
        if (pos.y !== savePos.y) {
            vdir = vdir === "u" ? "d" : "u";
            pos.y = savePos.y
        }
        /* on very tiny screens, the submenu may overlap the parent menu,
         * so we recalculate the position again, but without adding the offset again */
        return getPosition(rect, pos, false);
    } else {
        return getPosition(rect, { x: parentOrEvent.clientX, y: parentOrEvent.clientY });
    }
}

/** returns a save position inside the viewport, given the desired position */
export function getPosition(rect: Rect, pos: Pos, addScrollOffset: boolean = true): Pos {
    /* https://github.com/nkappler/ctxmenu/issues/31
     * When body has a transform applied, `position: fixed` behaves differently.
     * We can fix it by adding the scroll offset of the window to the viewport dimensions
     * and to the desired position */
    const html = document.documentElement;
    const width = html.clientWidth;
    const height = html.clientHeight;
    const hasTransform = document.body.style.transform !== "";
    const minX = hasTransform ? window.scrollX : 0;
    const minY = hasTransform ? window.scrollY : 0;
    const maxX = hasTransform ? width + window.scrollX : width;
    const maxY = hasTransform ? height + window.scrollY : height;
    if (hasTransform && addScrollOffset) {
        pos.x += window.scrollX;
        pos.y += window.scrollY;
    }

    return {
        x: hdir === "r"
            ? pos.x + rect.width > maxX ? maxX - rect.width : pos.x
            : pos.x < minX ? minX : pos.x,
        y: vdir === "d"
            ? pos.y + rect.height > maxY ? maxY - rect.height : pos.y
            : pos.y < minY ? minY : pos.y
    };
}

export function getUnmountedBoundingRect(elem: HTMLElement): Rect {
    const container = elem.cloneNode(true) as HTMLElement;
    container.style.visibility = "hidden";
    document.body.appendChild(container);
    const result = getBoundingRect(container);
    document.body.removeChild(container);
    return result;
}

export function getBoundingRect(elem: HTMLElement): Rect {
    const { offsetLeft: x, offsetTop: y, offsetHeight: height, offsetWidth: width } = elem;
    if (elem.offsetParent instanceof HTMLElement) {
        // This isn't too bad for performance, but it would be nice if we could get rid of the recursiveness
        const parent = getBoundingRect(elem.offsetParent);
        return {
            x: x + parent.x,
            y: y + parent.y,
            width: width,
            height: height
        }
    }
    return {
        x,
        y,
        width,
        height
    };
}

export function resetDirections() {
    hdir = "r";
    vdir = "d";
};