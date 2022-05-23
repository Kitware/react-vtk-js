# Contributing to react-vtk-js
---

We welcome you to join the development of react-vtk-js. This document will help you through the process.

## Before You Start

Please follow the coding style:

- Follow [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript).
- Use soft-tabs with a two space indent.
- Don't put commas first.

## Workflow

1. The react-vtk-js source is maintained [on GitHub](https://github.com/kitware/react-vtk-js).
2. [Fork react-vtk-js](https://help.github.com/articles/fork-a-repo/) into your user's namespace on GitHub.
3. Clone the repository to your computer.

    ```sh
    $ git clone https://github.com/<username>/react-vtk-js.git
    $ cd react-vtk-js
    ```

4. Configure the upstream remote and update the local master branch

    ```sh
    $ git remote add https://github.com/kitware/react-vtk-js.git
    $ git fetch upstream --prune --tags
    $ git checkout master
    $ git pull upstream master
    ```

4. Run the install script for react-vtk-js dependencies:
    ```sh
    $ npm install
    ```

5. Create a feature branch.

    ```
    $ git checkout -b new_feature
    ```

4. Start hacking.

    ```sh
    $ edit file1 file2 file3
    $ git add file1 file2 file3
    ```

5. Use Commitizen to create commits

    ```sh
    $ npm run commit
    ```

6. Push commits in your feature branch to your fork in GitHub:

    ```sh
    $ git push origin new_feature
    ```

7. Visit your fork in Github, browse to the "**Pull Requests**" link on the left, and use the 
   "**New Pull Request**" button in the upper right to create a Pull Request.

    For more information see: 
    [Create a Pull Request](https://help.github.com/articles/creating-a-pull-request/)

8. react-vtk-js uses GitHub for code review and Github Actions to validate proposed patches before they are merged.

## Notice

- Don't modify the version number in `package.json`. It will be automatically updated after the PR
  is merged.

## Reporting Issues

If you encounter problems using react-vtk-js you may be able to find the solutions in the
[vtk-js troubleshooting docs](https://kitware.github.io/vtk-js/docs/misc_troubleshooting.html), in an 
existing [GitHub issue](https://github.com/kitware/react-vtk-js/issues), or via the 
[VTK discourse page](https://discourse.vtk.org/).
If you can't find the answer, please 
[report a new issue on GitHub](https://github.com/Kitware/react-vtk-js/issues/new).
