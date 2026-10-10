# theme editor

An editing component for any theme.
> Live editing.
> Save only on confirmation.
> Save as existing theme vs. save as new theme warning.
> Input for name of new theme.
> Save in same theme set as existing.

- should create a temporary duplicate of the `FractalTokens` at `src/lib/types.ts`, and front that for the live theme editing, so that existing theme is not directly edited.
- If user saves as new theme, write those token values under new theme name.
- If user saves as existing theme, write values onto the same theme editing its current colors.

## Props

For Sveltekit with Svelte 5, any component uses modern Svelte 5 to front its props.

Theme editor needs to take in the theme's name as its prop, along with the token values that theme sets for the `FractalTokens` tokens.

## UI

1. A preview area that shows Header, Left Sidebar, Center Area, Right Sidebar, Footer - classic docs view.
2. In center area shows 2 buttons, a card, and a popover, and an input, and a select, and an area with sample text.

- center area to use `bg`.
- left and right sidebar to use `bg-panel`.
- header and footer - `bg-surface`.
- 1 button - `bg-button`.
- 2nd button - `bg-extra`.
- popover - `bg-raised`.
- input and select - `bg-sunken`
- card - `state-surface`.
- sample text
    - write "Text Primary" in `text-primary`
    - write "Text Secondary" in `text-secondary`
    - write "Text Muted" in `text-muted`

- in left sidebar show 3 square boxes with backgrounds-
    - `theme-color`, `theme-color-alt`, `theme-color-sub`

- in right sidebar show 4 circles with backgrounds:
    - `info`, `warning`, `danger`, `success`
    - on hover, show `info-hover`, `warning-hover`, `danger-hover`, `success-hover`

- use card on hover to show `state-hover`, and card:active to show `state-surface`.
- use popover to show options of `border`, `border-strong`, `border-subtle`

- each demo to show text of the token's name. A live color picker. And the #hexcode value.

## Components

Create and reuse these components for consistency

### Color Area

Component showing each color square, name, hex code, color picker.
- has subcomponent in it "Color Picker"

```
<div class="box">
    <div class="row gap-bs">
        <ColorPicker/>
        <div>
            <input> <!--show text input type with real time display of current hex code in color picker, starts with default hex value of the token it is being used for--!>
        </div>
    </div>
    <div class="row gap-bs">
        <span class="text-sm"> <!--name of token--!>
    </div>
</div>
```

### Color Picker

Regular hex code color picker with spectrum to drag on, live color changes on drag and stops when drag stops.