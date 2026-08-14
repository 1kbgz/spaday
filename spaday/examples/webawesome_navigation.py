"""Build application navigation, menus, tabs, and overlays with WebAwesome.

Run ``python -m spaday.examples.webawesome_navigation`` and open http://127.0.0.1:8011.
"""

from spaday_webawesome import (
    WaAccordion,
    WaAccordionItem,
    WaBreadcrumb,
    WaBreadcrumbItem,
    WaButton,
    WaButtonGroup,
    WaDetails,
    WaDialog,
    WaDrawer,
    WaDropdown,
    WaDropdownItem,
    WaPage,
    WaPopover,
    WaTab,
    WaTabGroup,
    WaTabPanel,
    WaTooltip,
    WaTree,
    WaTreeItem,
)

from spaday import Sequence, SetField, SetProp, by_id, cond, element, eq, field
from spaday.components.shell import Column, Row, Show

STYLE = """<style>
body { margin: 0; font-family: system-ui, sans-serif; }
wa-page { min-height: 100vh; }
.page-header { box-sizing: border-box; width: 100%; flex-wrap: wrap; }
.header-actions { flex-wrap: wrap; }
.navigation-list { box-sizing: border-box; min-width: 14rem; padding: .75rem; }
.nav-link { width: 100%; }
.nav-link::part(base) { box-sizing: border-box; justify-content: flex-start; width: 100%; }
.page-content { box-sizing: border-box; width: min(100%, 68rem); padding: 1.5rem; margin: 0 auto; }
.project-grid { display: grid; grid-template-columns: minmax(13rem, 18rem) minmax(0, 1fr); gap: 1.5rem; align-items: start; }
.project-tree { box-sizing: border-box; padding: 1rem; border: 1px solid var(--wa-color-neutral-border-normal); border-radius: .5rem; }
@media (max-width: 700px) {
  .project-grid { grid-template-columns: 1fr; }
}
</style>"""


def _navigation_button(label: str, section: str) -> WaButton:
    active = eq(field("section"), section)
    return (
        WaButton()
        .classes("nav-link")
        .text(label)
        .compute("appearance", cond(active, "filled", "plain"))
        .compute("variant", cond(active, "brand", "neutral"))
        .on(
            "click",
            Sequence(
                SetField("section", section),
                SetProp(by_id("workspace-page"), "navOpen", False),
            ),
        )
    )


def build_page() -> WaPage:
    """Return a responsive application shell with state-driven navigation."""
    account_menu = (
        WaDropdown(placement="bottom-end")
        .child_in("trigger", WaButton(appearance="plain", with_caret=True).text("Ada Lovelace"))
        .child(
            WaDropdownItem(value="profile").text("Profile"),
            WaDropdownItem(value="preferences", type="checkbox", checked=True).text("Use saved preferences"),
            WaDropdownItem(value="sign-out", variant="danger").text("Sign out"),
        )
    )

    navigation = Column(
        element("strong").text("Workspace"),
        _navigation_button("Overview", "overview"),
        _navigation_button("Projects", "projects"),
        _navigation_button("Settings", "settings"),
        class_="navigation-list",
        gap="0.35rem",
    )

    overview = Column(
        element("h1").text("Workspace overview"),
        element("p").text("Project Atlas is on track. Review onboarding tasks or jump to the project workspace."),
        WaAccordion(mode="multiple").child(
            WaAccordionItem(label="Getting started", expanded=True).text("Invite teammates and create your first project."),
            WaAccordionItem(label="Keyboard shortcuts").text("Press / to focus search and ? to open help."),
        ),
        gap="1rem",
    )

    project_tabs = (
        WaTabGroup(active="summary")
        .child_in("nav", WaTab(panel="summary").text("Summary"))
        .child_in("nav", WaTab(panel="activity").text("Activity"))
        .child(
            WaTabPanel(name="summary").child(
                WaDetails(summary="Latest deployment", appearance="outlined", open=True).text("Production deployed successfully 12 minutes ago.")
            ),
            WaTabPanel(name="activity").child(element("p").text("Ada moved “Keyboard navigation” into review.")),
        )
    )
    project_tree = (
        WaTree(selection="single")
        .classes("project-tree")
        .child(
            WaTreeItem(
                "Project Atlas",
                WaTreeItem(selected=True).text("Current sprint"),
                WaTreeItem().text("Backlog"),
                expanded=True,
            ),
            WaTreeItem().text("Design system"),
            WaTreeItem().text("Archive"),
        )
    )
    project_actions = WaButtonGroup(label="Project actions").child(
        WaButton(variant="brand").text("New project").on("click", SetProp(by_id("create-dialog"), "open", True)),
        WaButton(appearance="outlined").text("Filters").on("click", SetProp(by_id("filters-drawer"), "open", True)),
    )
    projects = Column(
        Row(element("h1").text("Projects"), project_actions, justify="space-between").style(flex_wrap="wrap"),
        element("p").text("Choose a project, then use its tabs to inspect the current state."),
        element("div", project_tree, project_tabs, class_="project-grid"),
        gap="1rem",
    )

    settings = Column(
        element("h1").text("Workspace settings"),
        element("p").text("Keep infrequent configuration out of the primary navigation flow."),
        WaDetails(summary="General", appearance="outlined", open=True).text("Workspace name, default project visibility, and locale."),
        WaDetails(summary="Notifications", appearance="outlined").text("Deployment, review, and account notification preferences."),
        gap="1rem",
    )

    dialog = (
        WaDialog(label="Create project", with_footer=True)
        .prop("id", "create-dialog")
        .child(element("p").text("A production dialog can contain the complete project form."))
        .child_in(
            "footer",
            Row(
                WaButton(appearance="outlined").text("Cancel").on("click", SetProp(by_id("create-dialog"), "open", False)),
                WaButton(variant="brand").text("Create").on("click", SetProp(by_id("create-dialog"), "open", False)),
                justify="end",
            ),
        )
    )
    drawer = (
        WaDrawer(label="Project filters", placement="end", with_footer=True)
        .prop("id", "filters-drawer")
        .child(element("p").text("Filter by owner, status, or updated date."))
        .child_in(
            "footer",
            WaButton(variant="brand").text("Apply filters").on("click", SetProp(by_id("filters-drawer"), "open", False)),
        )
    )

    header_actions = Row(
        WaButton(appearance="plain").prop("id", "help-trigger").text("Help"),
        account_menu,
        class_="header-actions",
        gap="0.25rem",
    )
    breadcrumbs = WaBreadcrumb(label="Workspace navigation").child(
        WaBreadcrumbItem().compute(
            "textContent",
            cond(
                eq(field("section"), "projects"),
                "Projects",
                cond(eq(field("section"), "settings"), "Settings", "Overview"),
            ),
        )
    )

    return (
        WaPage(mobile_breakpoint="800px")
        .prop("id", "workspace-page")
        .child_in(
            "header",
            Row(
                element("strong").text("Atlas workspace"),
                header_actions,
                justify="space-between",
                class_="page-header",
            ),
        )
        .child_in("navigation", navigation)
        .child_in("main-header", breadcrumbs)
        .child(
            Column(
                Show(overview, when=eq(field("section"), "overview")),
                Show(projects, when=eq(field("section"), "projects")),
                Show(settings, when=eq(field("section"), "settings")),
                class_="page-content",
            ),
            WaPopover(for_="help-trigger", placement="bottom-end").child(
                element("strong").text("Need help?"),
                element("p").text("Open the command menu or read the project guide."),
            ),
            WaTooltip(for_="help-trigger", placement="bottom").text("Open contextual help"),
            dialog,
            drawer,
        )
        .child_in("footer", element("small").text("Navigation state changes entirely in the browser."))
    )


def create_app():
    """Create the optional Starlette app used by the runnable example."""
    from spaday.backends.starlette import serve

    return serve(
        build_page,
        packages=["webawesome"],
        store={"section": "overview"},
        title="spaday — application navigation",
        head=STYLE,
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(create_app(), host="127.0.0.1", port=8011)
