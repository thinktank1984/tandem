<p align="center">
  <img src="assets/logo.svg" width="170px">
  <h1 align="center">Tandem (Preview)</h1>
</p>

<br />

> This repository is _temporarily_ private until bugs & UX issues have been worked out. I'd like to make sure that everything is solid before public testing, so please don't share the app. 🙂

<br />

Tandem is a visual editor for building web components. It can cover _most_ of your HTML & CSS development, and is designed to be compatible with most web-based languages, and frameworks. It currently works with React.


## Features

Features are actively being _discovered_ while Tandem is applied to real problems (currently being used to build itself). Here are just a few highlights:

#### Compiles to code

Compile UI files to your language or framework of choice. You can even compile to _multiple_ targets if you want to. React is currently supported, static HTML, PHP, Vue, and other targets are in the pipeline.

#### Immediate Feedback

Visually manipulate HTML & CSS. No need to wait for builds, or refreshing the browser. More tools and optimizations (like using Rust) are in the pipeline to further speed up the process of creating HTML & CSS.

#### Organizes like code

Transparent, and unopinionated about how you work or organize your application. 

#### Automatically translate designs from Sketch & Figma

Tandem provides [CLI tooling](./packages/paperclip-design-converter) for Sketch & figma that allow you to quickly translate design files (not completely though, you still need to specify layout constraints however). You'll soon be able to even use your original design files as the source of truth for basic styles like colors & fonts.

## Resources

Ready to get started? Here are a few resources to help you out:

- [User Guide](./docs/user-guide)
- [Terminology & Concepts](./docs/concepts.md)
- [Goals & Non-goals](./docs/goals.md)
- [Design process](./docs/design-process.md)
- [Examples](https://github.com/tandemcode/examples)
- [Document format](./docs/document-format.md)
- Contributing
  - [Development](./docs/contributing/development.md)
