# Breaking Changes & Migration

## v1 to v2

V2 represents a major shift away from the class-based components towards functional components. There are several goals and reasons for this migration:
- Addresses some bugs inherent in how contexts were being consumed.
- Addresses a major issue with regards to parent-child unmounting order being at odds with vtk.js resource management.
- Migrates the codebase to Typescript and React 18. This also means we will expose Typescript types.
- Does some clean-up on props and some confusing component usage.
- Addresses rendering performance via batching.

Once V2 is released, V1 will be considered legacy. Bugfixes may still be made for it, but V2 will be considered current.

### Picking

The `View` component no longer has any of the picking modes or picking props. Instead, a new `<Picking />` component is provided. Most of the API has been moved over with no changes, except for the following:

-   `setProps` prop and the `*info` readonly props, which have been removed.
-   `onSelect` has been removed. Instead, look at the Picking example for how to get the same functionality.

There is a new `onHoverDebounceWait` parameter that determines the debounce wait threshold for the onHover event.

`View.pick` from before has been split into `pick` and `pickWithFrustum`, since they return different types.


### GeometryRepresentation

The cube axes and scalar bar have been split out into their own components.

### Algorithm

`<Algorithm>` can take both a vtk.js class as a string name or as the vtk.js class directly. In both cases, you must import the class in order for it to register with the vtk string constructor.

### ShareDataSet

ShareDataSet is no longer global. You must specify a ShareDataSetRoot as an ancestor to the subtree in which you wish to use ShareDataSet. The new API looks like the following:

    <ShareDataSetRoot>
      <RegisterDataSet id="cone">
        <Algorithm vtkClass={vtkConeSource} />
      </RegisterDataSet>
      <View>
        <GeometryRepresentation>
          <UseDataSet id="cone" />
        </GeometryRepresentation>
      </View>
    </ShareDataSetRoot>

### View

The View imperative ref API has changed completely. Refer to the `IView` type for more info. Examples of changes needed:

-   `view.camera` is now `view.getCamera()`
-   `view.openglRenderWindow` is now `view.getOpenGLRenderWindow().get()`
-   `view.interactor` is now `view.getRenderWindow().getInteractor()`
-   `view.renderView()` is now `view.requestRender()`

The `autoResetCamera` prop supercedes the `triggerResetCamera` prop. When `autoResetCamera` is true (by default), camera will now reset whenever the data in the scene changes.

The `triggerRender` prop is removed in favor of using the imperative API: `viewRef.current.requestRender()`.

The `camera` prop supercedes the old `camera*` prefixed props (i.e. cameraPosition, cameraFocalPoint, etc.). `camera` must be specified as a collection of camera properties to be set.

The default keybinds for resetting the camera (`KeyR`) has been removed. Application developers should decide if they want this functionality back by adding a keyboard listener and calling `viewRef.current.resetCamera()`.

All picking props have been removed. See the `<Picking />` component.

### Contexts

The exposed contexts have changed APIs and names. The following is a list of available contexts (from `contexts.ts`):

-   OpenGLRenderWindowContext
-   RenderWindowContext
-   RendererContext
-   FieldDataContext
-   DatasetContext
-   RepresentationContext
-   DownstreamContext
-   ShareDataSetContext
-   MultiViewRootContext
-   ViewContext

### MultiViewRoot

The `disabled` prop no longer exists.

### Reader

-   `arrayBuffer` prop now accepts an ArrayBuffer. `base64ArrayBuffer` takes a Base64 string of an ArrayBuffer.
-   `vtkClass` prop now takes a vtk class. String is still supported, but you must import to register the class first.
-   `renderOnUpdate` and `resetCameraOnUpdate` no longer exist. This is automatic.
-   `options` has been renamed to `urlOptions`.
-   `id` is not used.
