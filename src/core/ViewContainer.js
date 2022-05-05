import React, { Component } from 'react';

import vtkOpenGLRenderWindow from '@kitware/vtk.js/Rendering/OpenGL/RenderWindow.js';
import vtkRenderWindow from '@kitware/vtk.js/Rendering/Core/RenderWindow.js';
import vtkRenderWindowInteractor from '@kitware/vtk.js/Rendering/Core/RenderWindowInteractor.js';
import vtkRenderer from '@kitware/vtk.js/Rendering/Core/Renderer.js';

import View from './View';
import { MultiViewRootContext } from './MultiViewRoot';

class ViewController extends Component {
  constructor(props) {
    super(props);

    this.renderer = vtkRenderer.newInstance();
    this.viewRef = React.createRef();

    if (props.root) {
      this.renderWindow = props.root.renderWindow;
      this.openglRenderWindow = props.root.renderWindowView;
      this.interactor = props.root.interactor;
    } else {
      this.renderWindow = vtkRenderWindow.newInstance();
      this.openglRenderWindow = vtkOpenGLRenderWindow.newInstance();
      this.renderWindow.addView(this.openglRenderWindow);

      this.interactor = vtkRenderWindowInteractor.newInstance();
      if (props.interactive) {
        this.interactor.setView(this.openglRenderWindow);
        this.interactor.initialize();
      }
      // this.interactor.setInteractorStyle(this.style);
    }

    this.renderWindow.addRenderer(this.renderer);

    this.onEnter = this.onEnter.bind(this);
    this.onResize = this.onResize.bind(this);
  }

  componentDidMount() {
    const view = this.viewRef.current;
    const container = view.containerRef.current;
    container.addEventListener('pointerenter', this.onEnter);

    if (!this.props.root) {
      this.openglRenderWindow.setContainer(container);
      if (this.props.interactive) {
        this.interactor.bindEvents(container);
      }
      this.interactor.setInteractorStyle(view.style);
    }
  }

  componentWillUnmount() {
    const view = this.viewRef.current;
    const container = view.containerRef.current;
    container.removeEventListener('pointerenter', this.onEnter);

    // MultiViewRoot parent may delete the render window first in WillUnmount.
    if (!this.renderWindow.isDeleted()) {
      this.renderWindow.removeRenderer(this.renderer);
    }

    if (this.props.root) {
      this.bindInteractorEvents(null);
    } else {
      // Detatch from DOM
      if (this.interactor.getContainer()) {
        this.interactor.unbindEvents();
      }
      this.openglRenderWindow.setContainer(null);

      if (!this.renderWindow.isDeleted()) {
        this.renderWindow.removeView(this.openglRenderWindow);
        this.renderWindow.delete();
      }

      this.interactor.delete();
      this.openglRenderWindow.delete();
    }

    this.renderer.delete();

    this.interactor = null;
    this.renderWindow = null;
    this.openglRenderWindow = null;
  }

  render() {
    const filteredProps = { ...this.props };
    delete filteredProps.root;

    return (
      <View
        renderWindow={this.renderWindow}
        renderWindowView={this.openglRenderWindow}
        renderer={this.renderer}
        interactor={this.interactor}
        ref={this.viewRef}
        onResize={this.onResize}
        {...filteredProps}
      />
    );
  }

  bindInteractorEvents(el) {
    const oldContainer = this.interactor.getContainer();
    if (oldContainer !== el) {
      if (oldContainer) {
        this.interactor.unbindEvents();
      }
      if (el) {
        this.interactor.bindEvents(el);
      }
    }
  }

  onEnter() {
    const view = this.viewRef.current;
    const container = view?.containerRef.current;
    if (this.props.root && container) {
      this.bindInteractorEvents(container);
      this.interactor.setInteractorStyle(view.style);
    }
  }

  onResize() {
    const container = this.viewRef.current?.containerRef.current;
    if (container) {
      if (this.props.root) {
        const containerBox = container.getBoundingClientRect();
        const canvasBox = this.openglRenderWindow
          .getCanvas()
          .getBoundingClientRect();

        // relative to canvas
        const top = containerBox.top - canvasBox.top;
        const left = containerBox.left - canvasBox.left;

        const xmin = left / canvasBox.width;
        const xmax = (left + containerBox.width) / canvasBox.width;
        const ymin = 1 - (top + containerBox.height) / canvasBox.height;
        const ymax = 1 - top / canvasBox.height;

        this.renderer.setViewport(xmin, ymin, xmax, ymax);
      } else {
        const devicePixelRatio = window.devicePixelRatio || 1;
        const { width, height } = container.getBoundingClientRect();
        const w = Math.floor(width * devicePixelRatio);
        const h = Math.floor(height * devicePixelRatio);
        this.openglRenderWindow.setSize(Math.max(w, 10), Math.max(h, 10));
        this.renderWindow.render();
      }
    }
  }
}

ViewController.defaultProps = View.defaultProps;
ViewController.propTypes = View.propTypes;

export default function ViewContainer(props) {
  return (
    <MultiViewRootContext.Consumer>
      {(root) => <ViewController {...props} root={root} />}
    </MultiViewRootContext.Consumer>
  );
}
