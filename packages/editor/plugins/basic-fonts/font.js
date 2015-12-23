import { Plugin } from 'editor/plugin/types';

class FontPlugin extends Plugin {

  constructor(value, weights, styles, decorations) {
    super({
      id          : value,
      type        : 'font',
      label       : value,
      value       : value,
      weights     : weights     || [],
      styles      : styles      || [],
      decorations : decorations || []
    });
  }

  getCombinedStyles() {
    var weights = this.weights;
    var styles  = this.styles;

    var allStyles = [];

    for (var weight of weights) {
      for (var style of styles) {
        allStyles.push([weight, style].join(' '));
      }
    }

    return allStyles;
  }
}

export default FontPlugin;
