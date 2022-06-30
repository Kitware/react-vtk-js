import React, { Component } from 'react';

import vtkOpenGLRenderWindow from '@kitware/vtk.js/Rendering/OpenGL/RenderWindow.js';
import vtkRenderWindow from '@kitware/vtk.js/Rendering/Core/RenderWindow.js';
import vtkRenderWindowInteractor from '@kitware/vtk.js/Rendering/Core/RenderWindowInteractor.js';
import vtkRenderer from '@kitware/vtk.js/Rendering/Core/Renderer.js';

import View, { ViewProps } from './View';
import { MultiViewRootContext } from './MultiViewRoot';

class ViewController extends Component<ViewProps> {
  static defaultProps = View.defaultProps;

  constructor(props: ViewProps) {
    super(props);

    this.renderer = vtkRenderer.newInstance();
    this.viewRef = React.createRef();
    this.resizeObserver = new ResizeObserver(() => this.onResize());

    if (props.root) {
      this.renderWindow = props.root.renderWindow;
      this.openglRenderWindow = props.root.renderWindowView;
      this.interactor = props.root.interactor;
    } else {
      this.renderWindow = vtkRenderWindow.newInstance();
      this.openglRenderWindow = vtkOpenGLRenderWindow.newInstance();
      this.interactor = vtkRenderWindowInteractor.newInstance();
    }

    this.onEnter = this.onEnter.bind(this);
    this.onResize = this.onResize.bind(this);
  }

  componentDidMount() {
    if (!this.props.root) {
      this.renderWindow.addView(this.openglRenderWindow);

      if (this.props.interactive) {
        this.interactor.setView(this.openglRenderWindow);
        this.interactor.initialize();
      }
    }
    this.renderWindow.addRenderer(this.renderer);

    const view = this.viewRef.current;
    const container = view?.containerRef.current;
    if (view && container) {
      container.addEventListener('pointerenter', this.onEnter);
      if (this.props.root) {
        this.props.root.observeRendererResize(container, this.renderer);
      } else {
        this.resizeObserver.observe(container);
        this.openglRenderWindow.setContainer(container);
        if (this.props.interactive) {
          this.interactor.bindEvents(container);
        }
        this.interactor.setInteractorStyle(view.style);
        // initial resize
        this.onResize();
      }
    }
  }

  componentWillUnmount() {
    const view = this.viewRef.current;
    const container = view.containerRef.current;
    container.removeEventListener('pointerenter', this.onEnter);

    this.resizeObserver.disconnect();
    if (this.props.root) {
      this.props.root.unobserveRendererResize(container);
    }

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
      this.interactor.setCurrentRenderer(this.renderer);
      this.interactor.setInteractorStyle(view.style);
    }
  }

  onResize() {
    const container = this.viewRef.current?.containerRef.current;
    if (container && !this.props.root) {
      const devicePixelRatio = window.devicePixelRatio || 1;
      const { width, height } = container.getBoundingClientRect();
      const w = Math.floor(width * devicePixelRatio);
      const h = Math.floor(height * devicePixelRatio);
      this.openglRenderWindow.setSize(Math.max(w, 10), Math.max(h, 10));
      this.renderWindow.render();
    }
  }
}

export default function ViewContainer(props) {
  return (
    <MultiViewRootContext.Consumer>
      {(root) => <ViewController {...props} root={root} />}
    </MultiViewRootContext.Consumer>
  );
}
