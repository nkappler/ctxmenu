/// <reference types="../standalone/ctxmenu" />

const params = new URLSearchParams(window.location.search);

const defaultMenuDeclaration: any = [
    { text: "Heading" },
    { isDivider: true },
    { text: "Link", href: "javascript:void" }
]; // as const would work when making the API arguments readonly, which in turn would guarantee that there are no sideeffects, however this is only necessary because we have no CTXMenu type here to begin with

const getTarget = (): HTMLElement => {
    const target = document.querySelector("#TARGET");
    if (target instanceof HTMLElement) return target;
    throw ("element #TARGET not found");
};

const getMenu = (): HTMLUListElement => {
    const menu = document.querySelector(".ctxmenu");
    if (menu instanceof HTMLUListElement) return menu;
    throw ("element .ctxmenu not found");
};

const showMenu = (menu: Parameters<typeof window.ctxmenu.show>[0], config?: Parameters<typeof window.ctxmenu.show>[2]) => {
    window.ctxmenu.show(menu, getTarget(), config);
    return getMenu().firstElementChild! as HTMLElement;
}

let error: jasmine.Spy;

const makeTarget = () => {
    const target = document.createElement("span");
    target.style.display = "inline-block";
    target.style.margin = "2rem";
    target.style.padding = "1rem";
    target.style.backgroundColor = "#55aaff";
    target.innerText = "TARGET";
    target.id = "TARGET";
    return target;
}

beforeAll(async () => new Promise<void>((resolve, reject) => {
    error = spyOn(console, "error");
    const content = document.querySelector("#jasmine_content");
    if (!content) {
        return reject("element#jasmine_content not found.");
    }
    content.appendChild(makeTarget());

    let interval = setInterval(() => {
        if (window.ctxmenu) {
            resolve();
            clearInterval(interval);
        }
    });
}));

beforeEach(() => {
    expect(console.error).not.toHaveBeenCalled();
    expect(document.querySelector(".ctxmenu")).withContext("cleanup failed").toBeNull();
    getTarget().dispatchEvent(new MouseEvent("contextmenu"));
    expect(getMenu).toThrow();
});

afterEach(async () => {
    const slow = params.get("slow");
    if (slow !== null) {
        await Promise.all([
            new Promise((resolve) => setTimeout(resolve, slow ? Number(slow) : 0)),
            new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
        ]);
    }

    window.ctxmenu.hide(); // todo should deleting an attached context menu also remove it from DOM? (probably should)
    error.and.stub();
    window.ctxmenu.delete("#TARGET");
    error.and.callThrough();
    error.calls.reset();
});
