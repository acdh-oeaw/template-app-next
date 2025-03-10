# TODO

## Button

- icon-only button
- should we have a Icon component with slot="icon"?
- pending icon separate?

## Checkbox

- refactor to have a different markup, which allows <FieldDescription>

## Popover

- overlay arrow
- submenu offset

## ListBoxItem

- <Text slot="label">
- <Text slot="description">
- inline grid for positioning selection check icon
- renderEmptyState()
- consider

## Select / ComboBox

- inline grid for trigger
- should the chevron(button) be a separate component

## RequiredIndicator

- should it be a separate component?

---

# Tailwind

- named group classes? (e.g. `group/select` or `group/[data-slot=field]` instead of just `group`) to
  avoid nesting problems
- conventions for `data-slot` attribute

---

# COMPOSITE

components with higher level api, which e.g. guarantee there is no gap between <Label> and
<FieldDescription>

---

# TEST

- forced-colors mode
- rac testing utils
