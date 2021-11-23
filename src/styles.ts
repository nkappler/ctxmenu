export const styles: Record<string, Partial<CSSStyleDeclaration>> = {
    ".ctxmenu": {
        position: "fixed",
        maxHeight: "100vh",
        border: "1px solid #999",
        padding: "2px 0",
        boxShadow: "3px 3px 3px #aaa",
        background: "#fff",
        margin: "0",
        fontSize: "15px",
        fontFamily: "Verdana, sans-serif",
        zIndex: "9999",
        overflowY: "auto"
    },
    ".ctxmenu li": {
        margin: "1px 0",
        display: "block",
        position: "relative",
        userSelect: "none",
        webkitUserSelect: "none"
    },
    ".ctxmenu li span": {
        display: "block",
        padding: "2px 20px",
        cursor: "default"
    },
    ".ctxmenu li a": {
        color: "inherit",
        textDecoration: "none"
    },
    ".ctxmenu li.icon": {
        paddingLeft: "15px"
    },
    ".ctxmenu img.icon": {
        position: "absolute",
        width: "18px",
        left: "10px",
        top: "2px"
    },
    ".ctxmenu li.disabled": {
        color: "#ccc"
    },
    ".ctxmenu li.divider": {
        borderBottom: "1px solid #aaa",
        margin: "5px 0"
    },
    ".ctxmenu li.interactive:hover": {
        background: "rgba(0,0,0,0.1)"
    },
    ".ctxmenu li.submenu::after": {
        content: "''",
        position: "absolute",
        display: "block",
        top: "0",
        bottom: "0",
        right: "0.4em",
        margin: "auto",
        borderRight: "1px solid #000",
        borderTop: "1px solid #000",
        transform: "rotate(45deg)",
        width: "0.3rem",
        height: "0.3rem",
        marginRight: "0.1rem"
    },
    ".ctxmenu li.submenu.disabled::after": {
        borderColor: "#ccc"
    }
};