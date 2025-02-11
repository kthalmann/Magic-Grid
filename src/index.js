/**
 * @author emmanuelolaojo
 * @since 11/10/18
 *
 * The MagicGrid class is an
 * implementation of a flexible
 * grid layout.
 */

import {
  checkParams,
  getMin
} from "./utils";

class MagicGrid {
  /**
   * Initializes the necessary variables
   * for a magic grid.
   *
   * @param config - configuration object
   */
  constructor (config) {
    checkParams(config);

    if (config.container instanceof HTMLElement) {
      this.container = config.container;
      this.containerClass = config.container.className;
    }
    else {
      this.containerClass = config.container;
      this.container = document.querySelector(config.container);
    }

    this.static = config.static || false;
    this.size = config.items;
    this.gutter = config.gutter;
    this.maxColumns = config.maxColumns || false;
    this.useMin = config.useMin || false;
    this.useTransform = config.useTransform;
    this.animate = config.animate || false;
    this.center = config.center;
    this.onReady = config.onReady || false;
    this.styledItems = new Set();

    this.initStyles();
  }

  /**
   * Initializes styles
   *
   * @private
   */
  initStyles () {
    if (!this.ready()) return;

    this.container.style.position = "relative";
    const items = this.items();

    for (let i = 0; i < items.length; i++) {
      if (this.styledItems.has(items[i])) continue;

      let style = items[i].style;

      style.position = "absolute";
  
      if (this.animate) {
        style.transition = `${this.useTransform ? "transform" : "top, left"} 0.2s ease`;
      }

      this.styledItems.add(items[i]);
    }
  }

  /**
   * Gets a collection of all items in a grid.
   *
   * @return {HTMLCollection}
   * @private
   */
  items () {
    return this.container.children;
  }

  /**
   * Calculates the width of a column.
   *
   * @return width of a column in the grid
   * @private
   */
  colWidth () {
    return this.items()[0].getBoundingClientRect().width + this.gutter;
  }

  /**
   * Initializes an array of empty columns
   * and calculates the leftover whitespace.
   *
   * @return {{cols: Array, wSpace: number}}
   * @private
   */
  setup () {
    let width = this.container.getBoundingClientRect().width;
    let colWidth = this.colWidth();
    let numCols = Math.floor((width + this.gutter)/colWidth) || 1;
    let cols = [];

    if (this.maxColumns && numCols > this.maxColumns) {
      numCols = this.maxColumns;
    }

    for (let i = 0; i < numCols; i++) {
      cols[i] = {height: 0, index: i};
    }

    let wSpace = width - numCols * colWidth + this.gutter;

    return {cols, wSpace};
  }

  /**
   * Gets the next available column.
   *
   * @param cols list of columns
   * @param i index of dom element
   *
   * @return {*} next available column
   * @private
   */
  nextCol (cols, i) {
    if (this.useMin) {
      return getMin(cols);
    }

    return cols[i % cols.length];
  }

  /**
   * Positions each item in the grid, based
   * on their corresponding column's height
   * and index then stretches the container to
   * the height of the grid.
   */
  positionItems () {
    let { cols, wSpace } = this.setup();
    let maxHeight = 0;
    let colWidth = this.colWidth();
    let items = this.items();

    wSpace = this.center ? Math.floor(wSpace / 2) : 0;

    this.initStyles();

    for (let i = 0; i < items.length; i++) {
      let col = this.nextCol(cols, i);
      let item = items[i];
      let topGutter = col.height ? this.gutter : 0;
      let left = col.index * colWidth + wSpace + "px";
      let top = col.height + topGutter + "px";

      if(this.useTransform){
        item.style.transform = `translate(${left}, ${top})`;
      }
      else{
        item.style.top = top;
        item.style.left = left;
      }

      col.height += item.getBoundingClientRect().height + topGutter;

      if(col.height > maxHeight){
        maxHeight = col.height;
      }
    }

    this.container.style.height = maxHeight + this.gutter + "px";
  }

  /**
   * Checks if every item has been loaded
   * in the dom.
   *
   * @return {Boolean} true if every item is present
   */
  ready () {
    if (this.static) return true;
    return this.items().length >= this.size;
  }

  /**
   * Periodically checks that all items
   * have been loaded in the dom. Calls
   * this.listen() once all the items are
   * present.
   *
   * @private
   */
  getReady () {
    let interval = setInterval(() => {
      this.container = document.querySelector(this.containerClass);

      if (this.ready()) {
        clearInterval(interval);

        this.listen();
      }
    }, 100);
  }

  /**
   * Positions all the items and
   * repositions them whenever the
   * window size changes.
   */
  listen () {
    if (this.ready()) {
      let timeout;

      window.addEventListener("resize", () => {
        if (!timeout){
          timeout = setTimeout(() => {
            this.positionItems();
            timeout = null;
          }, 200);
        }
      });

      this.positionItems();

      // throw ready event
      this.onReady && this.onReady();
    }
    else this.getReady();
  }
}

export default MagicGrid;
