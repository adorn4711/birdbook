# Birdbook

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.0.5.


Link for add googlesheets:{https://www.npmjs.com/package/google-spreadsheet?activeTab=readme} 

## How to connect to remote git

```
git remote add origin git@github-private:adorn4711/birdbook.git
```
### Create a prod version

[angular-cli-ghpages]{https://github.com/angular-schule/angular-cli-ghpages}

``` 
                                    14:59:50
bun ng add angular-cli-ghpages 
```
bun ng build  --base-href "https://adorn4711.github.io/birdbook"
```
It creates a dist folder
### Running version
Deployes the current respository to gitactions:
- clone origin/gh-pages to temp space
- merge current workspace in temp space
- do other stuff
- upload in origin/gh-pages. 
- gitaction will start to deploy
```
bun ng build --configuration production
bun ng deploy
```
https://adorn4711.github.io/birdbook/
https://adorn4711.github.io/birdbook/

## Development server

To start a local development server, run:

```bash
bun ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

## Backend informatiom

- Local ``http://localhost:3000`
- On Vercel `https://googlesheetbackend-git-dev-adorn4711s-projects.vercel.app`

## Vercel protection bypass (local dev)

If your Vercel backend is protected, start Angular with the bypass secret in an environment variable:

```bash
VERCEL_BYPASS_SECRET=your_secret_here bun run start:vercel_backend
```

The `vercel_backend` proxy configuration sends:
- `x-vercel-protection-bypass`
- `x-vercel-set-bypass-cookie: true`



