# babel-plugin-transform-css-modules

The plugin detects CSS Modules imports of the form `import <styleImportName> from "./<componentName>.module.css"` and replaces usages of `<styleImportName>.*` with string literals if possible. Otherwise, it creates a mapping object.

## Example

**input.jsx**

```jsx
import * as React from "react";
import { clsx } from "clsx";
import styles from "./Component.module.css";

const headerLevelClassName = {
  1: styles["Component__header--level-1"],
  2: styles["Component__header--level-2"],
};

const Component = ({ mode, level = 1, disabled, children }) => {
  const headerClassName = clsx(
    styles.Component__header,
    headerLevelClassName[level]
  );
  return (
    <div
      className={clsx(
        styles.Component,
        disabled && styles["Component--disabled"]
      )}
    >
      <h2 className={headerClassName}>{children}</h2>
    </div>
  );
};
```

**output.js**

```js
import * as React from "react";
import { clsx } from "clsx";

var headerLevelClassName = {
  1: "_Component__header--level-1_526t4_19",
  2: "_Component__header--level-2_526t4_21",
};

var Component = ({ mode, level = 1, disabled, children }) => {
  const headerClassName = clsx(
    "_Component__header_526t4_17",
    headerLevelClassName[level]
  );
  return /*#__PURE__*/ React.createElement(
    "div",
    {
      className: clsx(
        "_Component_526t4_1",
        disabled && "_Component--disabled_526t4_3"
      ),
    },
    /*#__PURE__*/ React.createElement(
      "h2",
      {
        className: headerClassName,
      },
      children
    )
  );
};
```

## Installation

```sh
npm install --save-dev babel-plugin-transform-css-modules
```

Enable the plugin in your Babel configuration:

```json
{
  "plugins": ["transform-css-modules"]
}
```

## Options

### `keep`

> Default: `false`

Preserves CSS imports.

```json
{
  "plugins": ["transform-css-modules", { "keep": true }]
}
```

**input.jsx**

```jsx
import * as React from "react";
import { clsx } from "clsx";
import styles from "./Component.module.css";

// ...
```

**output.js**

```js
import * as React from "react";
import { clsx } from "clsx";
import "./Component.module.css";

// ...
```

## Computed property names

> ⚠️ Not recommended — it's better to create explicit collections. Nevertheless, the plugin supports computed strings with some
> limitations.

```js
styles[`Component--mode-${mode}`];
```

The plugin takes the left string part of the computed key and searches the `styles` object for all keys that start with this string. For the above example, it would be:

```js
Object.keys(styles).filter((key) => key.startsWith("Component--mode-"));
```

This filtered `styles` object is appended to the end of the output file.

You must follow these rules:

- The beginning of the string must not be computed:

  ```js
  // ❌
  styles[`${someOtherVariable}-Component--mode-${mode}`]; // the plugin will ignore this case

  // ✅
  styles[`Component--mode-${mode}`]; // the search will be performed using `Component--mode-`
  ```

- Class names must be unique to avoid injecting unrelated styles:

  ```js
  // ❌
  styles[`Component--${mode}`];
  styles[`Component--${appearance}-${gradientColor}`];

  // ✅
  styles[`Component--mode-${mode}`];
  styles[`Component--gradient-${appearance}-${gradientColor}`];
  ```

Example where the rule was not followed:

**input.jsx**

```jsx
import * as React from "react";
import { clsx } from "clsx";
import styles from "./Component.module.css";

const Component = ({ appearance, gradientColor, disabled }) => {
  return (
    <div
      className={clsx(
        styles.Component,
        disabled && styles["Component--disabled"],
        styles[`Component--${appearance}-${gradientColor}`]
      )}
    />
  );
};
```

**output.js**

```js
import * as React from "react";
import { clsx } from "clsx";

var Component = ({ appearance, gradientColor, disabled }) => {
  return /*#__PURE__*/ React.createElement("div", {
    className: clsx(
      "_Component_526t4_1",
      disabled && "_Component--disabled_526t4_3",
      styles[`Component--${appearance}-${gradientColor}`]
    ),
  });
};

var styles = {
  "Component--disabled": "_Component--disabled_526t4_3", // (*) because the search was performed using `Component--`
  "Component--light-blue": "_Component--light-blue_526t4_9",
  "Component--dark-blue": "_Component--dark-blue_526t4_13",
};
```

## Alternatives

There are similar plugins, but each has its own limitations and tradeoffs:

- [babel-plugin-css-modules-transform](https://github.com/michalkvasnicak/babel-plugin-css-modules-transform)

  - Generates a JS object with all selectors from the CSS file, which can bloat the bundle. Example:

    ```diff
    -import styles from './Component.css';
    -<div className={styles.Component} />
    +const styles = {
    +  Component: '_Component-xaWd_',
    +  Component__item: '_Component__item-a21x_',
    +  AnotherComponent: '_AnotherComponent__item-a21x_', // refers to `.AnotherComponent > .Component { color: tomato }`
    +};
    +<div className={styles.Component} />
    ```

- [babel-plugin-react-css-modules](https://github.com/gajus/babel-plugin-react-css-modules)

  - Requires that styles be accessed inside attributes specified by the `attributeNames` option:

    ```jsx
    // ❌ doesn't work like this
    import styles from "./Component.css";
    const className = styles.Component;
    <div styleName={className} />;
    ```

  - Using conditions and functions forces the plugin to generate a runtime wrapper (see [Runtime `styleName` resolution](https://github.com/gajus/babel-plugin-react-css-modules#runtime-stylename-resolution)). This is often the case, since `clsx()` and conditional classes are commonly used — which can increase bundle size.
