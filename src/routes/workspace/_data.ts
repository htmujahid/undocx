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
          colWidths: [200, 130, 150, 100, 160],
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
                {
                  direction: "ltr", format: "", indent: 0, version: 1,
                  type: "tablecell", headerState: 1, colSpan: 1, rowSpan: 1, width: null,
                  children: [{ direction: "ltr", format: "", indent: 0, version: 1, type: "paragraph", textFormat: 0, textStyle: "", children: [{ detail: 0, format: 1, mode: "normal", style: "", version: 1, type: "text", text: "Data requirements" }] }],
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
                {
                  direction: "ltr", format: "", indent: 0, version: 1,
                  type: "tablecell", headerState: 0, colSpan: 1, rowSpan: 1, width: null,
                  children: [{ direction: "ltr", format: "", indent: 0, version: 1, type: "paragraph", textFormat: 0, textStyle: "", children: [{ detail: 0, format: 0, mode: "normal", style: "", version: 1, type: "text", text: "Small to medium" }] }],
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
                {
                  direction: "ltr", format: "", indent: 0, version: 1,
                  type: "tablecell", headerState: 0, colSpan: 1, rowSpan: 1, width: null,
                  children: [{ direction: "ltr", format: "", indent: 0, version: 1, type: "paragraph", textFormat: 0, textStyle: "", children: [{ detail: 0, format: 0, mode: "normal", style: "", version: 1, type: "text", text: "Small to medium" }] }],
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
                {
                  direction: "ltr", format: "", indent: 0, version: 1,
                  type: "tablecell", headerState: 0, colSpan: 1, rowSpan: 1, width: null,
                  children: [{ direction: "ltr", format: "", indent: 0, version: 1, type: "paragraph", textFormat: 0, textStyle: "", children: [{ detail: 0, format: 0, mode: "normal", style: "", version: 1, type: "text", text: "Large" }] }],
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
                {
                  direction: "ltr", format: "", indent: 0, version: 1,
                  type: "tablecell", headerState: 0, colSpan: 1, rowSpan: 1, width: null,
                  children: [{ direction: "ltr", format: "", indent: 0, version: 1, type: "paragraph", textFormat: 0, textStyle: "", children: [{ detail: 0, format: 0, mode: "normal", style: "", version: 1, type: "text", text: "Medium" }] }],
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

        // ── H2: Quick Reference ──────────────────────────────────────────────
        {
          children: [{ detail: 0, format: 0, mode: "normal", style: "", version: 1, type: "text", text: "Quick Reference" }],
          direction: "ltr", format: "", indent: 0, version: 1,
          type: "heading", tag: "h2",
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
