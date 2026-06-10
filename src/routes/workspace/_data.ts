export const data = {
  editorState: {
    root: {
      children: [
        // ── Opening ──────────────────────────────────────────────────────────
        {
          children: [
            {
              detail: 0, format: 0, mode: "normal", style: "", version: 1,
              type: "text",
              text: "Machine learning enables systems to improve through experience rather than explicit instructions. It sits at the intersection of statistics, optimisation, and computer science — and has quietly become the engine behind most modern software.",
            },
          ],
          direction: "ltr", format: "", indent: 0, version: 1,
          type: "paragraph", textFormat: 0, textStyle: "",
        },
        {
          children: [
            { detail: 0, format: 0, mode: "normal", style: "", version: 1, type: "text", text: "A model does not need to be told the rules. " },
            { detail: 0, format: 1, mode: "normal", style: "", version: 1, type: "text", text: "Given enough examples, it finds them on its own." },
          ],
          direction: "ltr", format: "", indent: 0, version: 1,
          type: "quote",
        },

        { type: "horizontalrule", version: 1 },

        // ── H1 ───────────────────────────────────────────────────────────────
        {
          children: [{ detail: 0, format: 0, mode: "normal", style: "", version: 1, type: "text", text: "Core Concepts" }],
          direction: "ltr", format: "", indent: 0, version: 1,
          type: "heading", tag: "h1",
        },
        {
          children: [
            { detail: 0, format: 0, mode: "normal", style: "", version: 1, type: "text", text: "There are three broad learning paradigms, each suited to different kinds of problems and data availability." },
          ],
          direction: "ltr", format: "", indent: 0, version: 1,
          type: "paragraph", textFormat: 0, textStyle: "",
        },

        {
          type: "callout", version: 1, calloutType: "note",
          direction: "ltr", format: "", indent: 0,
          children: [{ children: [{ detail: 0, format: 0, mode: "normal", style: "", version: 1, type: "text", text: "All three paradigms can complement each other — a real-world pipeline often chains unsupervised pre-training with supervised fine-tuning." }], direction: "ltr", format: "", indent: 0, version: 1, type: "paragraph", textFormat: 0, textStyle: "" }],
        },
        {
          type: "callout", version: 1, calloutType: "tip",
          direction: "ltr", format: "", indent: 0,
          children: [{ children: [{ detail: 0, format: 0, mode: "normal", style: "", version: 1, type: "text", text: "Start with a simple baseline model before reaching for complex architectures. A well-tuned linear model often beats a poorly-tuned neural network." }], direction: "ltr", format: "", indent: 0, version: 1, type: "paragraph", textFormat: 0, textStyle: "" }],
        },
        {
          type: "callout", version: 1, calloutType: "warning",
          direction: "ltr", format: "", indent: 0,
          children: [{ children: [{ detail: 0, format: 0, mode: "normal", style: "", version: 1, type: "text", text: "Avoid evaluating on training data. Always hold out a test set before any exploration to prevent data leakage." }], direction: "ltr", format: "", indent: 0, version: 1, type: "paragraph", textFormat: 0, textStyle: "" }],
        },
        {
          type: "callout", version: 1, calloutType: "danger",
          direction: "ltr", format: "", indent: 0,
          children: [{ children: [{ detail: 0, format: 0, mode: "normal", style: "", version: 1, type: "text", text: "Deploying a model without monitoring for distribution shift can silently degrade production accuracy over time." }], direction: "ltr", format: "", indent: 0, version: 1, type: "paragraph", textFormat: 0, textStyle: "" }],
        },

        // ── H2: Supervised Learning ──────────────────────────────────────────
        {
          children: [{ detail: 0, format: 0, mode: "normal", style: "", version: 1, type: "text", text: "Supervised Learning" }],
          direction: "ltr", format: "", indent: 0, version: 1,
          type: "heading", tag: "h2",
        },
        {
          children: [
            { detail: 0, format: 0, mode: "normal", style: "", version: 1, type: "text", text: "In supervised learning a model trains on " },
            { detail: 0, format: 1, mode: "normal", style: "", version: 1, type: "text", text: "labelled data" },
            { detail: 0, format: 0, mode: "normal", style: "", version: 1, type: "text", text: " — input–output pairs — and learns to map inputs to outputs. Common tasks include " },
            { detail: 0, format: 2, mode: "normal", style: "", version: 1, type: "text", text: "classification" },
            { detail: 0, format: 0, mode: "normal", style: "", version: 1, type: "text", text: " and " },
            { detail: 0, format: 2, mode: "normal", style: "", version: 1, type: "text", text: "regression" },
            { detail: 0, format: 0, mode: "normal", style: "", version: 1, type: "text", text: "." },
          ],
          direction: "ltr", format: "", indent: 0, version: 1,
          type: "paragraph", textFormat: 0, textStyle: "",
        },

        {
          children: [{ detail: 0, format: 1, mode: "normal", style: "", version: 1, type: "text", text: "Classification" }],
          direction: "ltr", format: "", indent: 1, version: 1,
          type: "paragraph", textFormat: 0, textStyle: "",
        },
        {
          children: [{ detail: 0, format: 0, mode: "normal", style: "", version: 1, type: "text", text: "Assigns a discrete label to each input. Examples include spam detection, image recognition, and medical diagnosis." }],
          direction: "ltr", format: "", indent: 2, version: 1,
          type: "paragraph", textFormat: 0, textStyle: "",
        },
        {
          children: [{ detail: 0, format: 1, mode: "normal", style: "", version: 1, type: "text", text: "Regression" }],
          direction: "ltr", format: "", indent: 1, version: 1,
          type: "paragraph", textFormat: 0, textStyle: "",
        },
        {
          children: [{ detail: 0, format: 0, mode: "normal", style: "", version: 1, type: "text", text: "Predicts a continuous value. House-price estimation and demand forecasting are canonical regression problems." }],
          direction: "ltr", format: "", indent: 2, version: 1,
          type: "paragraph", textFormat: 0, textStyle: "",
        },

        // ── H2: Unsupervised Learning ────────────────────────────────────────
        {
          children: [{ detail: 0, format: 0, mode: "normal", style: "", version: 1, type: "text", text: "Unsupervised Learning" }],
          direction: "ltr", format: "", indent: 0, version: 1,
          type: "heading", tag: "h2",
        },
        {
          children: [
            { detail: 0, format: 0, mode: "normal", style: "", version: 1, type: "text", text: "Unsupervised methods find structure in data without labels. The most common tasks are " },
            { detail: 0, format: 2, mode: "normal", style: "", version: 1, type: "text", text: "clustering" },
            { detail: 0, format: 0, mode: "normal", style: "", version: 1, type: "text", text: " — grouping similar examples — and " },
            { detail: 0, format: 2, mode: "normal", style: "", version: 1, type: "text", text: "dimensionality reduction" },
            { detail: 0, format: 0, mode: "normal", style: "", version: 1, type: "text", text: ", which compresses data while preserving its structure." },
          ],
          direction: "ltr", format: "", indent: 0, version: 1,
          type: "paragraph", textFormat: 0, textStyle: "",
        },

        // ── H2: Key Algorithms ───────────────────────────────────────────────
        {
          children: [{ detail: 0, format: 0, mode: "normal", style: "", version: 1, type: "text", text: "Key Algorithms" }],
          direction: "ltr", format: "", indent: 0, version: 1,
          type: "heading", tag: "h2",
        },
        {
          children: [
            { detail: 0, format: 0, mode: "normal", style: "", version: 1, type: "text", text: "Classical algorithms remain widely used because they are interpretable, fast to train, and require far less data than deep models." },
          ],
          direction: "ltr", format: "", indent: 0, version: 1,
          type: "paragraph", textFormat: 0, textStyle: "",
        },
        {
          children: [
            {
              children: [
                { detail: 0, format: 1, mode: "normal", style: "", version: 1, type: "text", text: "Linear Regression" },
                { detail: 0, format: 0, mode: "normal", style: "", version: 1, type: "text", text: " — predicts a continuous output from input features" },
              ],
              direction: "ltr", format: "", indent: 0, version: 1, type: "listitem", value: 1,
            },
            {
              children: [
                { detail: 0, format: 1, mode: "normal", style: "", version: 1, type: "text", text: "Decision Trees" },
                { detail: 0, format: 0, mode: "normal", style: "", version: 1, type: "text", text: " — recursive rule-based classification and regression" },
              ],
              direction: "ltr", format: "", indent: 0, version: 1, type: "listitem", value: 2,
            },
            {
              children: [
                { detail: 0, format: 1, mode: "normal", style: "", version: 1, type: "text", text: "Random Forest" },
                { detail: 0, format: 0, mode: "normal", style: "", version: 1, type: "text", text: " — ensemble of decision trees with bootstrap aggregation" },
              ],
              direction: "ltr", format: "", indent: 0, version: 1, type: "listitem", value: 3,
            },
            {
              children: [
                { detail: 0, format: 1, mode: "normal", style: "", version: 1, type: "text", text: "Support Vector Machine" },
                { detail: 0, format: 0, mode: "normal", style: "", version: 1, type: "text", text: " — finds the maximum-margin hyperplane separating classes" },
              ],
              direction: "ltr", format: "", indent: 0, version: 1, type: "listitem", value: 4,
            },
          ],
          direction: "ltr", format: "", indent: 0, version: 1,
          type: "list", listType: "bullet", start: 1, tag: "ul",
        },

        // ── H2: Training Pipeline ────────────────────────────────────────────
        {
          children: [{ detail: 0, format: 0, mode: "normal", style: "", version: 1, type: "text", text: "Training Pipeline" }],
          direction: "ltr", format: "", indent: 0, version: 1,
          type: "heading", tag: "h2",
        },
        {
          children: [
            { detail: 0, format: 0, mode: "normal", style: "", version: 1, type: "text", text: "A standard supervised training pipeline follows these steps regardless of the algorithm chosen." },
          ],
          direction: "ltr", format: "", indent: 0, version: 1,
          type: "paragraph", textFormat: 0, textStyle: "",
        },
        {
          children: [
            {
              children: [
                { detail: 0, format: 1, mode: "normal", style: "", version: 1, type: "text", text: "Collect & clean data" },
                { detail: 0, format: 0, mode: "normal", style: "", version: 1, type: "text", text: " — remove nulls, normalise features, handle class imbalance" },
              ],
              direction: "ltr", format: "", indent: 0, version: 1, type: "listitem", value: 1,
            },
            {
              children: [
                { detail: 0, format: 1, mode: "normal", style: "", version: 1, type: "text", text: "Split into train / validation / test sets" },
              ],
              direction: "ltr", format: "", indent: 0, version: 1, type: "listitem", value: 2,
            },
            {
              children: [
                { detail: 0, format: 1, mode: "normal", style: "", version: 1, type: "text", text: "Choose and fit a model" },
                { detail: 0, format: 0, mode: "normal", style: "", version: 1, type: "text", text: " — select architecture, optimiser, and loss function" },
              ],
              direction: "ltr", format: "", indent: 0, version: 1, type: "listitem", value: 3,
            },
            {
              children: [
                { detail: 0, format: 1, mode: "normal", style: "", version: 1, type: "text", text: "Evaluate on held-out test set" },
                { detail: 0, format: 0, mode: "normal", style: "", version: 1, type: "text", text: " — accuracy, F1, RMSE depending on the task" },
              ],
              direction: "ltr", format: "", indent: 0, version: 1, type: "listitem", value: 4,
            },
            {
              children: [
                { detail: 0, format: 1, mode: "normal", style: "", version: 1, type: "text", text: "Deploy and monitor" },
                { detail: 0, format: 0, mode: "normal", style: "", version: 1, type: "text", text: " — watch for data drift and model degradation over time" },
              ],
              direction: "ltr", format: "", indent: 0, version: 1, type: "listitem", value: 5,
            },
          ],
          direction: "ltr", format: "", indent: 0, version: 1,
          type: "list", listType: "number", start: 1, tag: "ol",
        },

        // ── H2: Algorithm Comparison ────────────────────────────────────────
        {
          children: [{ detail: 0, format: 0, mode: "normal", style: "", version: 1, type: "text", text: "Algorithm Comparison" }],
          direction: "ltr", format: "", indent: 0, version: 1,
          type: "heading", tag: "h2",
        },
        {
          children: [
            { detail: 0, format: 0, mode: "normal", style: "", version: 1, type: "text", text: "The table below summarises the four classical algorithms across key dimensions." },
          ],
          direction: "ltr", format: "", indent: 0, version: 1,
          type: "paragraph", textFormat: 0, textStyle: "",
        },
        {
          direction: "ltr", format: "", indent: 0, version: 1,
          type: "table",
          colWidths: [200, 130, 150, 150],
          rowStriping: true,
          children: [
            // Header row
            {
              direction: "ltr", format: "", indent: 0, version: 1,
              type: "tablerow", height: 0,
              children: [
                {
                  direction: "ltr", format: "", indent: 0, version: 1,
                  type: "tablecell", headerState: 1, colSpan: 1, rowSpan: 1, width: null,
                  children: [{ direction: "ltr", format: "", indent: 0, version: 1, type: "paragraph", textFormat: 0, textStyle: "", children: [{ detail: 0, format: 1, mode: "normal", style: "", version: 1, type: "text", text: "Algorithm" }] }],
                },
                {
                  direction: "ltr", format: "", indent: 0, version: 1,
                  type: "tablecell", headerState: 1, colSpan: 1, rowSpan: 1, width: null,
                  children: [{ direction: "ltr", format: "", indent: 0, version: 1, type: "paragraph", textFormat: 0, textStyle: "", children: [{ detail: 0, format: 1, mode: "normal", style: "", version: 1, type: "text", text: "Task type" }] }],
                },
                {
                  direction: "ltr", format: "", indent: 0, version: 1,
                  type: "tablecell", headerState: 1, colSpan: 1, rowSpan: 1, width: null,
                  children: [{ direction: "ltr", format: "", indent: 0, version: 1, type: "paragraph", textFormat: 0, textStyle: "", children: [{ detail: 0, format: 1, mode: "normal", style: "", version: 1, type: "text", text: "Interpretability" }] }],
                },
                {
                  direction: "ltr", format: "", indent: 0, version: 1,
                  type: "tablecell", headerState: 1, colSpan: 1, rowSpan: 1, width: null,
                  children: [{ direction: "ltr", format: "", indent: 0, version: 1, type: "paragraph", textFormat: 0, textStyle: "", children: [{ detail: 0, format: 1, mode: "normal", style: "", version: 1, type: "text", text: "Training speed" }] }],
                },
              ],
            },
            // Row 1 — Linear Regression
            {
              direction: "ltr", format: "", indent: 0, version: 1,
              type: "tablerow", height: 0,
              children: [
                {
                  direction: "ltr", format: "", indent: 0, version: 1,
                  type: "tablecell", headerState: 0, colSpan: 1, rowSpan: 1, width: null,
                  children: [{ direction: "ltr", format: "", indent: 0, version: 1, type: "paragraph", textFormat: 0, textStyle: "", children: [{ detail: 0, format: 16, mode: "normal", style: "", version: 1, type: "text", text: "Linear Regression" }] }],
                },
                {
                  direction: "ltr", format: "", indent: 0, version: 1,
                  type: "tablecell", headerState: 0, colSpan: 1, rowSpan: 1, width: null,
                  children: [{ direction: "ltr", format: "", indent: 0, version: 1, type: "paragraph", textFormat: 0, textStyle: "", children: [{ detail: 0, format: 0, mode: "normal", style: "", version: 1, type: "text", text: "Regression" }] }],
                },
                {
                  direction: "ltr", format: "", indent: 0, version: 1,
                  type: "tablecell", headerState: 0, colSpan: 1, rowSpan: 1, width: null,
                  children: [{ direction: "ltr", format: "", indent: 0, version: 1, type: "paragraph", textFormat: 0, textStyle: "", children: [{ detail: 0, format: 0, mode: "normal", style: "", version: 1, type: "text", text: "High" }] }],
                },
                {
                  direction: "ltr", format: "", indent: 0, version: 1,
                  type: "tablecell", headerState: 0, colSpan: 1, rowSpan: 1, width: null,
                  children: [{ direction: "ltr", format: "", indent: 0, version: 1, type: "paragraph", textFormat: 0, textStyle: "", children: [{ detail: 0, format: 0, mode: "normal", style: "", version: 1, type: "text", text: "Fast" }] }],
                },
              ],
            },
            // Row 2 — Decision Trees
            {
              direction: "ltr", format: "", indent: 0, version: 1,
              type: "tablerow", height: 0,
              children: [
                {
                  direction: "ltr", format: "", indent: 0, version: 1,
                  type: "tablecell", headerState: 0, colSpan: 1, rowSpan: 1, width: null,
                  children: [{ direction: "ltr", format: "", indent: 0, version: 1, type: "paragraph", textFormat: 0, textStyle: "", children: [{ detail: 0, format: 16, mode: "normal", style: "", version: 1, type: "text", text: "Decision Trees" }] }],
                },
                {
                  direction: "ltr", format: "", indent: 0, version: 1,
                  type: "tablecell", headerState: 0, colSpan: 1, rowSpan: 1, width: null,
                  children: [{ direction: "ltr", format: "", indent: 0, version: 1, type: "paragraph", textFormat: 0, textStyle: "", children: [{ detail: 0, format: 0, mode: "normal", style: "", version: 1, type: "text", text: "Both" }] }],
                },
                {
                  direction: "ltr", format: "", indent: 0, version: 1,
                  type: "tablecell", headerState: 0, colSpan: 1, rowSpan: 1, width: null,
                  children: [{ direction: "ltr", format: "", indent: 0, version: 1, type: "paragraph", textFormat: 0, textStyle: "", children: [{ detail: 0, format: 0, mode: "normal", style: "", version: 1, type: "text", text: "High" }] }],
                },
                {
                  direction: "ltr", format: "", indent: 0, version: 1,
                  type: "tablecell", headerState: 0, colSpan: 1, rowSpan: 1, width: null,
                  children: [{ direction: "ltr", format: "", indent: 0, version: 1, type: "paragraph", textFormat: 0, textStyle: "", children: [{ detail: 0, format: 0, mode: "normal", style: "", version: 1, type: "text", text: "Fast" }] }],
                },
              ],
            },
            // Row 3 — Random Forest
            {
              direction: "ltr", format: "", indent: 0, version: 1,
              type: "tablerow", height: 0,
              children: [
                {
                  direction: "ltr", format: "", indent: 0, version: 1,
                  type: "tablecell", headerState: 0, colSpan: 1, rowSpan: 1, width: null,
                  children: [{ direction: "ltr", format: "", indent: 0, version: 1, type: "paragraph", textFormat: 0, textStyle: "", children: [{ detail: 0, format: 16, mode: "normal", style: "", version: 1, type: "text", text: "Random Forest" }] }],
                },
                {
                  direction: "ltr", format: "", indent: 0, version: 1,
                  type: "tablecell", headerState: 0, colSpan: 1, rowSpan: 1, width: null,
                  children: [{ direction: "ltr", format: "", indent: 0, version: 1, type: "paragraph", textFormat: 0, textStyle: "", children: [{ detail: 0, format: 0, mode: "normal", style: "", version: 1, type: "text", text: "Both" }] }],
                },
                {
                  direction: "ltr", format: "", indent: 0, version: 1,
                  type: "tablecell", headerState: 0, colSpan: 1, rowSpan: 1, width: null,
                  children: [{ direction: "ltr", format: "", indent: 0, version: 1, type: "paragraph", textFormat: 0, textStyle: "", children: [{ detail: 0, format: 0, mode: "normal", style: "", version: 1, type: "text", text: "Medium" }] }],
                },
                {
                  direction: "ltr", format: "", indent: 0, version: 1,
                  type: "tablecell", headerState: 0, colSpan: 1, rowSpan: 1, width: null,
                  children: [{ direction: "ltr", format: "", indent: 0, version: 1, type: "paragraph", textFormat: 0, textStyle: "", children: [{ detail: 0, format: 0, mode: "normal", style: "", version: 1, type: "text", text: "Moderate" }] }],
                },
              ],
            },
            // Row 4 — SVM
            {
              direction: "ltr", format: "", indent: 0, version: 1,
              type: "tablerow", height: 0,
              children: [
                {
                  direction: "ltr", format: "", indent: 0, version: 1,
                  type: "tablecell", headerState: 0, colSpan: 1, rowSpan: 1, width: null,
                  children: [{ direction: "ltr", format: "", indent: 0, version: 1, type: "paragraph", textFormat: 0, textStyle: "", children: [{ detail: 0, format: 16, mode: "normal", style: "", version: 1, type: "text", text: "Support Vector Machine" }] }],
                },
                {
                  direction: "ltr", format: "", indent: 0, version: 1,
                  type: "tablecell", headerState: 0, colSpan: 1, rowSpan: 1, width: null,
                  children: [{ direction: "ltr", format: "", indent: 0, version: 1, type: "paragraph", textFormat: 0, textStyle: "", children: [{ detail: 0, format: 0, mode: "normal", style: "", version: 1, type: "text", text: "Classification" }] }],
                },
                {
                  direction: "ltr", format: "", indent: 0, version: 1,
                  type: "tablecell", headerState: 0, colSpan: 1, rowSpan: 1, width: null,
                  children: [{ direction: "ltr", format: "", indent: 0, version: 1, type: "paragraph", textFormat: 0, textStyle: "", children: [{ detail: 0, format: 0, mode: "normal", style: "", version: 1, type: "text", text: "Low" }] }],
                },
                {
                  direction: "ltr", format: "", indent: 0, version: 1,
                  type: "tablecell", headerState: 0, colSpan: 1, rowSpan: 1, width: null,
                  children: [{ direction: "ltr", format: "", indent: 0, version: 1, type: "paragraph", textFormat: 0, textStyle: "", children: [{ detail: 0, format: 0, mode: "normal", style: "", version: 1, type: "text", text: "Slow" }] }],
                },
              ],
            },
          ],
        },

        // ── H2: Code Example ────────────────────────────────────────────────
        {
          children: [{ detail: 0, format: 0, mode: "normal", style: "", version: 1, type: "text", text: "Code Example" }],
          direction: "ltr", format: "", indent: 0, version: 1,
          type: "heading", tag: "h2",
        },
        {
          children: [
            { detail: 0, format: 0, mode: "normal", style: "", version: 1, type: "text", text: "A minimal supervised learning pipeline using " },
            { detail: 0, format: 16, mode: "normal", style: "", version: 1, type: "text", text: "scikit-learn" },
            { detail: 0, format: 0, mode: "normal", style: "", version: 1, type: "text", text: ":" },
          ],
          direction: "ltr", format: "", indent: 0, version: 1,
          type: "paragraph", textFormat: 0, textStyle: "",
        },
        {
          direction: "ltr", format: "", indent: 0, version: 1,
          type: "code", language: "python",
          children: [
            { detail: 0, format: 0, mode: "normal", style: "", version: 1, type: "text", text: "from sklearn.datasets import load_iris\nfrom sklearn.model_selection import train_test_split\nfrom sklearn.ensemble import RandomForestClassifier\nfrom sklearn.metrics import accuracy_score\n\nX, y = load_iris(return_X_y=True)\nX_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)\n\nmodel = RandomForestClassifier(n_estimators=100, random_state=42)\nmodel.fit(X_train, y_train)\n\npredictions = model.predict(X_test)\nprint(f\"Accuracy: {accuracy_score(y_test, predictions):.2%}\")" },
          ],
        },

        // ── H2: Visualizations ───────────────────────────────────────────────
        {
          children: [{ detail: 0, format: 0, mode: "normal", style: "", version: 1, type: "text", text: "Visualizations" }],
          direction: "ltr", format: "", indent: 0, version: 1,
          type: "heading", tag: "h2",
        },
        {
          children: [{ detail: 0, format: 0, mode: "normal", style: "", version: 1, type: "text", text: "Training accuracy across epochs, visualised as an SVG bar chart:" }],
          direction: "ltr", format: "", indent: 0, version: 1,
          type: "paragraph", textFormat: 0, textStyle: "",
        },
        {
          type: "html", version: 1, display: "block",
          children: [{ type: "text", version: 1, format: 0, detail: 0, mode: "normal", style: "", text: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200" width="400" height="200" aria-label="Training accuracy bar chart"><rect x="30" y="140" width="40" height="40" fill="currentColor" fill-opacity="0.15" rx="2"/><rect x="90" y="110" width="40" height="70" fill="currentColor" fill-opacity="0.2" rx="2"/><rect x="150" y="80" width="40" height="100" fill="currentColor" fill-opacity="0.25" rx="2"/><rect x="210" y="55" width="40" height="125" fill="currentColor" fill-opacity="0.3" rx="2"/><rect x="270" y="35" width="40" height="145" fill="currentColor" fill-opacity="0.35" rx="2"/><rect x="330" y="20" width="40" height="160" fill="currentColor" fill-opacity="0.45" rx="2"/><line x1="20" y1="180" x2="390" y2="180" stroke="currentColor" stroke-opacity="0.2" stroke-width="1"/><text x="50" y="196" text-anchor="middle" font-size="11" fill="currentColor" fill-opacity="0.5">E1</text><text x="110" y="196" text-anchor="middle" font-size="11" fill="currentColor" fill-opacity="0.5">E2</text><text x="170" y="196" text-anchor="middle" font-size="11" fill="currentColor" fill-opacity="0.5">E3</text><text x="230" y="196" text-anchor="middle" font-size="11" fill="currentColor" fill-opacity="0.5">E4</text><text x="290" y="196" text-anchor="middle" font-size="11" fill="currentColor" fill-opacity="0.5">E5</text><text x="350" y="196" text-anchor="middle" font-size="11" fill="currentColor" fill-opacity="0.5">E6</text><text x="200" y="12" text-anchor="middle" font-size="12" font-weight="600" fill="currentColor" fill-opacity="0.7">Training Accuracy by Epoch</text></svg>' }],
        },
        {
          children: [{ detail: 0, format: 0, mode: "normal", style: "", version: 1, type: "text", text: "The gradient-descent parameter update rule expressed in MathML:" }],
          direction: "ltr", format: "", indent: 0, version: 1,
          type: "paragraph", textFormat: 0, textStyle: "",
        },
        {
          type: "html", version: 1, display: "block",
          children: [{ type: "text", version: 1, format: 0, detail: 0, mode: "normal", style: "", text: '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mrow><msub><mi>θ</mi><mrow><mi>t</mi><mo>+</mo><mn>1</mn></mrow></msub><mo>=</mo><msub><mi>θ</mi><mi>t</mi></msub><mo>−</mo><mi>η</mi><msub><mo>∇</mo><mi>θ</mi></msub><mi mathvariant="script">L</mi><mo>(</mo><msub><mi>θ</mi><mi>t</mi></msub><mo>)</mo></mrow></math>' }],
        },

        // ── H2: Quick Reference ──────────────────────────────────────────────
        {
          children: [{ detail: 0, format: 0, mode: "normal", style: "", version: 1, type: "text", text: "Quick Reference" }],
          direction: "ltr", format: "", indent: 0, version: 1,
          type: "heading", tag: "h2",
        },
        {
          children: [
            { detail: 0, format: 0, mode: "normal", style: "", version: 1, type: "text", text: "The model minimises cross-entropy loss " },
            {
              type: "html", version: 1, display: "inline",
              children: [{ type: "text", version: 1, format: 0, detail: 0, mode: "normal", style: "", text: '<math xmlns="http://www.w3.org/1998/Math/MathML"><mi mathvariant="script">L</mi><mo>=</mo><mo>-</mo><munder><mo>∑</mo><mi>i</mi></munder><msub><mi>y</mi><mi>i</mi></msub><mo>log</mo><msub><mover><mi>y</mi><mo>^</mo></mover><mi>i</mi></msub></math>' }],
            },
            { detail: 0, format: 0, mode: "normal", style: "", version: 1, type: "text", text: " over all training samples." },
          ],
          direction: "ltr", format: "", indent: 0, version: 1,
          type: "paragraph", textFormat: 0, textStyle: "",
        },
        {
          children: [
            { detail: 0, format: 0, mode: "normal", style: "", version: 1, type: "text", text: "Use " },
            { detail: 0, format: 16, mode: "normal", style: "", version: 1, type: "text", text: "scikit-learn" },
            { detail: 0, format: 0, mode: "normal", style: "", version: 1, type: "text", text: " for classical algorithms, " },
            { detail: 0, format: 16, mode: "normal", style: "", version: 1, type: "text", text: "PyTorch" },
            { detail: 0, format: 0, mode: "normal", style: "", version: 1, type: "text", text: " or " },
            { detail: 0, format: 16, mode: "normal", style: "", version: 1, type: "text", text: "TensorFlow" },
            { detail: 0, format: 0, mode: "normal", style: "", version: 1, type: "text", text: " for deep learning. Full documentation is available on the " },
            {
              children: [{ detail: 0, format: 0, mode: "normal", style: "", version: 1, type: "text", text: "scikit-learn website" }],
              direction: "ltr", format: "", indent: 0, version: 1,
              type: "link", rel: "noopener", target: null, title: null, url: "https://scikit-learn.org",
            },
            { detail: 0, format: 0, mode: "normal", style: "", version: 1, type: "text", text: "." },
          ],
          direction: "ltr", format: "", indent: 0, version: 1,
          type: "paragraph", textFormat: 0, textStyle: "",
        },
      ],
      direction: "ltr", format: "", indent: 0, version: 1,
      type: "root",
    },
  },
  lastSaved: 1781058822270,
  source: "Renderical",
  version: "0.45.0",
}
