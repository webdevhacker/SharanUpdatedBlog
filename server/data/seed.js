/**
 * Database seed script.
 * Run with: npm run seed
 *
 * Creates:
 *  - An admin user (if no users exist)
 *  - 12 realistic tech blog posts (if no posts exist)
 */

require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// We import models directly (bypassing the normal app boot)
const User = require("../models/User");
const Post = require("../models/Post");

// ---------------------------------------------------------------------------
// Seed data
// ---------------------------------------------------------------------------

const ADMIN = {
  name: "Admin",
  email: "admin@techblog.dev",
  password: "Admin@123",
  role: "admin",
  isVerified: true,
  bio: "TechBlog administrator and lead author.",
};

const POSTS = [
  {
    title: "Building Scalable APIs with Node.js and Express",
    excerpt:
      "Learn how to design and build production-ready REST APIs using Node.js, Express, and MongoDB — with best practices for authentication, validation, and error handling.",
    category: "Programming",
    tags: ["Node.js", "Express", "REST API", "MongoDB", "Backend"],
    status: "published",
    content: `<h2>Introduction</h2>
<p>Building scalable APIs is one of the most critical skills for modern backend developers. In this guide, we'll walk through building a production-ready API using Node.js, Express, and MongoDB — the popular MERN stack backend.</p>
<h2>Project Structure</h2>
<p>A well-organised project structure is the foundation of maintainability. We recommend separating concerns into <code>routes/</code>, <code>controllers/</code>, <code>models/</code>, and <code>middleware/</code> directories. This separation ensures that each layer has a single responsibility and remains testable in isolation.</p>
<h2>Authentication with JWT</h2>
<p>JSON Web Tokens (JWTs) are the industry standard for stateless authentication. We use a dual-token strategy: a short-lived <strong>access token</strong> (15 minutes) and a long-lived <strong>refresh token</strong> (30 days) stored in the database. This approach balances security and user experience.</p>
<pre><code>const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });</code></pre>
<h2>Input Validation and Sanitisation</h2>
<p>Never trust user input. Always validate incoming data before processing it. Libraries like <code>express-validator</code> or <code>joi</code> provide schema-based validation. Additionally, sanitise inputs with <code>express-mongo-sanitize</code> to prevent NoSQL injection attacks.</p>
<h2>Error Handling</h2>
<p>A centralised error handler makes your API predictable and easy to debug. Define a global error middleware in Express that formats all errors into a consistent JSON structure: <code>{ success: false, message: string }</code>. Always distinguish between operational errors (user's fault) and programmer errors (your fault).</p>
<h2>Conclusion</h2>
<p>Building scalable APIs requires disciplined architecture, robust error handling, and security-first thinking. By following these patterns, you'll build APIs that can grow with your application and handle thousands of concurrent users with confidence.</p>`,
  },
  {
    title: "React 18 Deep Dive: Concurrent Features Explained",
    excerpt:
      "React 18 introduced a paradigm shift with concurrent rendering. Explore useTransition, useDeferredValue, Suspense boundaries, and the new root API.",
    category: "Web Dev",
    tags: ["React", "React 18", "Frontend", "JavaScript", "Concurrent Mode"],
    status: "published",
    content: `<h2>What is Concurrent React?</h2>
<p>React 18's biggest addition is the Concurrent Renderer — a behind-the-scenes mechanism that allows React to prepare multiple versions of the UI at the same time. This unlocks features that weren't possible before: interruptible rendering, background updates, and smoother user experiences.</p>
<h2>The New Root API</h2>
<p>The entry point for React 18 apps changed. You now use <code>createRoot</code> instead of <code>ReactDOM.render</code>. This single change unlocks all concurrent features automatically.</p>
<pre><code>import { createRoot } from 'react-dom/client';
const root = createRoot(document.getElementById('root'));
root.render(&lt;App /&gt;);</code></pre>
<h2>useTransition for Non-Urgent Updates</h2>
<p>The <code>useTransition</code> hook lets you mark state updates as "transitions" — meaning they can be interrupted by more urgent updates like user input. This is perfect for search filtering, tab switching, or any update that doesn't need to be instantaneous.</p>
<h2>useDeferredValue</h2>
<p>Similar to <code>useTransition</code>, <code>useDeferredValue</code> lets you defer re-rendering expensive child components. It's like a built-in debounce that's smarter about scheduling — it uses React's scheduler to defer work until the browser is idle.</p>
<h2>Suspense for Data Fetching</h2>
<p>React 18 expands Suspense beyond just lazy-loaded components. When combined with data fetching libraries like React Query or Relay, Suspense boundaries can show loading states while async data loads — without writing a single loading boolean.</p>
<h2>Conclusion</h2>
<p>React 18's concurrent features represent the biggest leap in React's capabilities since hooks. They may require rethinking how you structure state updates, but the payoff in performance and user experience is enormous.</p>`,
  },
  {
    title: "Docker for Developers: From Zero to Production",
    excerpt:
      "A practical guide to Docker — from understanding containers and images to building multi-stage Dockerfiles and deploying with Docker Compose.",
    category: "DevOps",
    tags: ["Docker", "DevOps", "Containers", "Deployment", "CI/CD"],
    status: "published",
    content: `<h2>Why Docker?</h2>
<p>Docker solves the classic "works on my machine" problem. By packaging your application and all its dependencies into a lightweight container, you guarantee consistent behaviour across development, staging, and production environments.</p>
<h2>Images vs Containers</h2>
<p>An <strong>image</strong> is a read-only snapshot of your application's filesystem. A <strong>container</strong> is a running instance of an image. Think of images as class definitions and containers as objects — you can create many containers from a single image.</p>
<h2>Writing a Production Dockerfile</h2>
<p>Multi-stage builds are essential for production. They let you use a heavy build image to compile your app, then copy only the artifacts into a minimal runtime image — dramatically reducing the final image size.</p>
<pre><code># Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Stage 2: Runtime
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
EXPOSE 5000
CMD ["node", "index.js"]</code></pre>
<h2>Docker Compose for Local Development</h2>
<p>Docker Compose lets you define multi-container applications in a single YAML file. You can spin up your API server, database, and cache layer with a single <code>docker-compose up</code> command — eliminating manual environment setup.</p>
<h2>Container Best Practices</h2>
<p>Always run containers as non-root users. Set memory and CPU limits. Use <code>.dockerignore</code> to exclude unnecessary files. Pin base image versions to avoid surprise breakages from upstream updates.</p>
<h2>Conclusion</h2>
<p>Docker has become an indispensable tool in the modern developer's toolkit. Once you containerise your first application, you'll wonder how you ever shipped software without it.</p>`,
  },
  {
    title: "Understanding TypeScript Generics: A Practical Guide",
    excerpt:
      "Generics are one of TypeScript's most powerful features. Learn how to write flexible, reusable, type-safe code with real-world examples.",
    category: "Programming",
    tags: ["TypeScript", "Generics", "JavaScript", "Type Safety", "Advanced"],
    status: "published",
    content: `<h2>What Are Generics?</h2>
<p>Generics allow you to write code that works with multiple types while maintaining full type safety. Instead of using <code>any</code> (which discards type information), generics let you parameterise types — writing functions and classes that adapt to the types they receive.</p>
<h2>Your First Generic Function</h2>
<p>The classic example is an identity function — a function that returns whatever you pass to it. Without generics, you'd have to choose between using <code>any</code> (unsafe) or writing separate functions for each type (verbose). With generics, you write it once:</p>
<pre><code>function identity&lt;T&gt;(value: T): T {
  return value;
}

const str = identity("hello"); // type: string
const num = identity(42);      // type: number</code></pre>
<h2>Generic Constraints</h2>
<p>Sometimes you need to restrict what types a generic can accept. Use the <code>extends</code> keyword to add constraints. For example, a function that reads the <code>length</code> property must constrain its generic to types that have that property.</p>
<h2>Generic Interfaces and Classes</h2>
<p>Generics shine when applied to data structures. A generic <code>Stack&lt;T&gt;</code> class can hold items of any type — strings, numbers, or complex objects — while remaining fully type-safe. The type parameter is specified once when you instantiate the class.</p>
<h2>Utility Types: Generics in the Standard Library</h2>
<p>TypeScript ships with dozens of built-in generic utility types: <code>Partial&lt;T&gt;</code>, <code>Required&lt;T&gt;</code>, <code>Pick&lt;T, K&gt;</code>, <code>Omit&lt;T, K&gt;</code>, <code>Record&lt;K, V&gt;</code>. Understanding these saves enormous amounts of boilerplate code.</p>
<h2>Conclusion</h2>
<p>Mastering generics is the turning point in a TypeScript developer's journey. They enable APIs that are simultaneously flexible and safe — the best of both worlds.</p>`,
  },
  {
    title: "Introduction to Large Language Models: How GPT Actually Works",
    excerpt:
      "Demystify the technology behind ChatGPT and other AI language models. Understand transformers, attention mechanisms, and how LLMs generate text.",
    category: "AI/ML",
    tags: ["AI", "LLM", "GPT", "Machine Learning", "Deep Learning", "NLP"],
    status: "published",
    content: `<h2>What is a Large Language Model?</h2>
<p>A Large Language Model (LLM) is a type of artificial intelligence trained on vast amounts of text data to predict and generate human language. Models like GPT-4, Claude, and Gemini can write code, answer questions, translate languages, and perform complex reasoning — all from learning patterns in text.</p>
<h2>The Transformer Architecture</h2>
<p>Every modern LLM is built on the Transformer architecture, introduced by Google in the landmark 2017 paper "Attention Is All You Need". The key insight was replacing recurrent neural networks (RNNs) with a self-attention mechanism that can process entire sequences in parallel.</p>
<h2>How Attention Works</h2>
<p>Self-attention allows each word (token) in a sequence to "attend to" every other token simultaneously. The model learns which relationships matter most. In the sentence "The animal didn't cross the street because it was tired", attention helps the model understand that "it" refers to "animal", not "street".</p>
<h2>Training: Next Token Prediction</h2>
<p>LLMs are trained using a deceptively simple objective: predict the next token in a sequence. Given billions of examples from the internet, books, and code, the model learns grammar, facts, reasoning patterns, and even coding conventions — all from this single training signal.</p>
<h2>Inference: How Text is Generated</h2>
<p>At inference time, LLMs generate text autoregressively — one token at a time. Each generated token is appended to the input and fed back into the model to generate the next token. Temperature and top-p sampling control the randomness of this process.</p>
<h2>Conclusion</h2>
<p>Understanding LLMs at a mechanistic level helps you use them more effectively and appreciate both their remarkable capabilities and their fundamental limitations. The field is advancing at an extraordinary pace, and the best is yet to come.</p>`,
  },
  {
    title: "CSS Grid Layout: The Complete Practical Guide",
    excerpt:
      "Master CSS Grid once and for all. This guide covers grid templates, areas, alignment, responsive patterns, and real-world layout examples.",
    category: "Web Dev",
    tags: ["CSS", "CSS Grid", "Frontend", "Layout", "Responsive Design"],
    status: "published",
    content: `<h2>Why CSS Grid?</h2>
<p>CSS Grid is the most powerful layout system available in CSS. It's a 2D system — meaning it can handle both columns and rows simultaneously — unlike Flexbox, which is primarily a 1D system. For complex page layouts, Grid is the right tool for the job.</p>
<h2>Defining a Grid Container</h2>
<p>Turn any element into a grid container with <code>display: grid</code>. Then define your columns and rows using <code>grid-template-columns</code> and <code>grid-template-rows</code>. The <code>fr</code> (fractional unit) is Grid's superpower — it distributes available space proportionally.</p>
<pre><code>.container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}</code></pre>
<h2>Grid Template Areas</h2>
<p>Grid areas let you define your layout visually using named regions. Place items by referencing their area names — the layout becomes self-documenting and trivially easy to modify.</p>
<h2>Alignment and Justification</h2>
<p>Grid gives you granular control over alignment along both axes. <code>justify-items</code> and <code>align-items</code> control inline and block alignment of items within their cells. <code>justify-content</code> and <code>align-content</code> control distribution of the entire grid within its container.</p>
<h2>Responsive Layouts Without Media Queries</h2>
<p>The <code>auto-fill</code> and <code>auto-fit</code> keywords, combined with <code>minmax()</code>, create fully responsive grids without a single media query. The grid automatically adjusts the number of columns based on available space.</p>
<h2>Conclusion</h2>
<p>CSS Grid transforms complex layouts from CSS gymnastics into clear, logical declarations. If you haven't adopted Grid yet, 2026 is the year to make it your primary layout tool.</p>`,
  },
  {
    title: "Git Internals: Understanding How Git Really Works",
    excerpt:
      "Go beyond git add and git commit. Explore Git's object model, DAGs, packfiles, refs, and the internal mechanics that make version control work.",
    category: "Technology",
    tags: ["Git", "Version Control", "Developer Tools", "Programming"],
    status: "published",
    content: `<h2>Git is a Content-Addressable Filesystem</h2>
<p>At its core, Git is not a version control system — it's a content-addressable key-value store. Every piece of content (files, commits, trees) is stored as an object identified by its SHA-1 hash. This design makes Git extraordinarily efficient and corruption-resistant.</p>
<h2>The Four Object Types</h2>
<p>Git has exactly four types of objects: <strong>blobs</strong> (file content), <strong>trees</strong> (directory listings), <strong>commits</strong> (snapshots with metadata), and <strong>tags</strong> (named references to commits). All four are stored identically in <code>.git/objects/</code>, compressed with zlib.</p>
<h2>The Commit Graph (DAG)</h2>
<p>Commits form a Directed Acyclic Graph (DAG). Each commit points to its parent commit(s), creating a history chain. Branches are simply named pointers (refs) to specific commits. <code>HEAD</code> is a pointer to the current branch (or directly to a commit in "detached HEAD" state).</p>
<h2>How Branching Really Works</h2>
<p>Creating a branch in Git is almost free — it just creates a new file in <code>.git/refs/heads/</code> containing a SHA-1 hash. Merging and rebasing both manipulate this graph, but in fundamentally different ways: merge creates a new commit with two parents; rebase replays commits onto a new base.</p>
<h2>Packfiles and Garbage Collection</h2>
<p>Git periodically runs garbage collection to compress loose objects into packfiles. Packfiles use delta compression — storing differences between similar objects — making repositories dramatically smaller over time.</p>
<h2>Conclusion</h2>
<p>Understanding Git's internals transforms you from a user who memorises commands to a developer who truly understands what's happening. When something goes wrong (and it will), this knowledge is invaluable.</p>`,
  },
  {
    title: "Kubernetes for Developers: Getting Started with Container Orchestration",
    excerpt:
      "Move beyond single containers with Kubernetes. Learn Pods, Deployments, Services, ConfigMaps, and how to deploy your first app to a K8s cluster.",
    category: "DevOps",
    tags: ["Kubernetes", "K8s", "DevOps", "Containers", "Cloud", "Docker"],
    status: "published",
    content: `<h2>Why Kubernetes?</h2>
<p>Docker is great for running single containers, but production applications need orchestration — automatic scaling, self-healing, load balancing, and rolling updates. Kubernetes (K8s) provides all of this and more, and has become the de facto standard for container orchestration.</p>
<h2>Core Concepts</h2>
<p>Kubernetes has a rich object model. <strong>Pods</strong> are the smallest deployable units — one or more containers sharing a network namespace. <strong>Deployments</strong> manage replica sets and handle rolling updates. <strong>Services</strong> provide stable network endpoints to pods. <strong>Namespaces</strong> isolate environments within a cluster.</p>
<h2>Your First Deployment</h2>
<p>A Kubernetes Deployment is defined in YAML and specifies the container image, number of replicas, resource limits, and update strategy. Kubernetes continuously reconciles the desired state (your YAML) with the actual state of the cluster.</p>
<pre><code>apiVersion: apps/v1
kind: Deployment
metadata:
  name: techblog-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: techblog-api
  template:
    spec:
      containers:
      - name: api
        image: techblog/api:latest
        ports:
        - containerPort: 5000</code></pre>
<h2>ConfigMaps and Secrets</h2>
<p>Never bake configuration into your container images. Use <strong>ConfigMaps</strong> for non-sensitive configuration and <strong>Secrets</strong> for sensitive values like database credentials. Both can be mounted as environment variables or files inside your pods.</p>
<h2>Horizontal Pod Autoscaling</h2>
<p>Kubernetes can automatically scale your Deployments based on CPU or memory usage. Define a HorizontalPodAutoscaler (HPA) and let K8s handle traffic spikes without any manual intervention.</p>
<h2>Conclusion</h2>
<p>Kubernetes has a steep learning curve, but the investment pays dividends in reliability, scalability, and operational efficiency. Start with a managed cluster (GKE, EKS, AKS) to skip the infrastructure complexity and focus on deploying your application.</p>`,
  },
  {
    title: "The Complete Guide to Web Accessibility (a11y)",
    excerpt:
      "Build websites that work for everyone. Learn WCAG guidelines, ARIA roles, semantic HTML, keyboard navigation, and how to audit your site for accessibility.",
    category: "Tutorial",
    tags: ["Accessibility", "a11y", "WCAG", "HTML", "Frontend", "UX"],
    status: "published",
    content: `<h2>Why Accessibility Matters</h2>
<p>Over 1 billion people worldwide live with some form of disability. Web accessibility ensures your content is usable by everyone — people with visual, motor, auditory, and cognitive impairments. Beyond ethics, accessibility is increasingly a legal requirement in many jurisdictions.</p>
<h2>WCAG: The Standard</h2>
<p>The Web Content Accessibility Guidelines (WCAG) 2.1 define four principles: Perceivable, Operable, Understandable, and Robust (POUR). WCAG defines three levels of conformance: A (minimum), AA (standard requirement), and AAA (enhanced). Most organisations target AA compliance.</p>
<h2>Semantic HTML is the Foundation</h2>
<p>Using the correct HTML elements is the single most impactful accessibility improvement you can make. Use <code>&lt;button&gt;</code> for buttons (not <code>&lt;div onclick&gt;</code>), <code>&lt;nav&gt;</code> for navigation, <code>&lt;main&gt;</code> for main content, and proper heading hierarchy (<code>&lt;h1&gt;</code>→<code>&lt;h6&gt;</code>).</p>
<h2>ARIA Roles and Attributes</h2>
<p>ARIA (Accessible Rich Internet Applications) supplements HTML semantics for complex interactive components. Use <code>aria-label</code> to describe elements that lack visible text, <code>aria-expanded</code> for toggleable content, and <code>role="dialog"</code> for modal windows. Remember: no ARIA is better than bad ARIA.</p>
<h2>Keyboard Navigation</h2>
<p>Every interactive element must be reachable and operable via keyboard alone. Ensure logical tab order, visible focus indicators, and trap focus within modals. Test your site by unplugging your mouse.</p>
<h2>Conclusion</h2>
<p>Accessibility is not a feature — it's a quality standard. Building with accessibility from the start is far easier than retrofitting it later. Your users (all of them) will thank you.</p>`,
  },
  {
    title: "PostgreSQL vs MongoDB: Choosing the Right Database in 2026",
    excerpt:
      "A detailed comparison of PostgreSQL and MongoDB for modern applications — covering data models, performance, scalability, transactions, and developer experience.",
    category: "Technology",
    tags: ["Database", "PostgreSQL", "MongoDB", "SQL", "NoSQL", "Backend"],
    status: "published",
    content: `<h2>The Great Database Debate</h2>
<p>One of the most common architecture decisions developers face is choosing between a relational database (like PostgreSQL) and a document database (like MongoDB). The right answer depends on your data model, query patterns, consistency requirements, and team expertise.</p>
<h2>Data Model</h2>
<p>PostgreSQL uses a rigid, schema-based relational model with tables, rows, and foreign keys. This enforces data integrity at the database level. MongoDB uses a flexible document model (JSON/BSON) where each document can have different fields — ideal for polymorphic data or rapidly evolving schemas.</p>
<h2>Transactions and ACID Compliance</h2>
<p>PostgreSQL has had full ACID transaction support since its inception. MongoDB added multi-document ACID transactions in version 4.0, but they come with significant performance overhead and are best avoided for most use cases. If your application requires complex, multi-entity transactions, PostgreSQL is the safer choice.</p>
<h2>Performance and Scaling</h2>
<p>Both databases can handle millions of records efficiently when properly indexed. PostgreSQL excels at complex JOIN queries and aggregate operations. MongoDB's document model eliminates the need for JOINs in many cases, making reads faster when data is co-located. For horizontal scaling, MongoDB's built-in sharding is simpler to configure than PostgreSQL's partitioning.</p>
<h2>Developer Experience</h2>
<p>MongoDB's JSON-like documents feel natural to JavaScript developers and integrate seamlessly with Node.js via Mongoose. PostgreSQL requires defining schemas upfront but rewards you with powerful SQL, full-text search, JSON columns, and extensions like PostGIS.</p>
<h2>Conclusion</h2>
<p>For structured financial or inventory data with complex relationships, choose PostgreSQL. For content, catalogs, user profiles, or any schema that evolves rapidly, MongoDB is an excellent fit. In 2026, both are mature, production-proven choices with strong managed cloud offerings.</p>`,
  },
  {
    title: "Building Your First Machine Learning Pipeline with Python",
    excerpt:
      "Learn to build an end-to-end ML pipeline: data cleaning, feature engineering, model training with scikit-learn, evaluation, and deployment with FastAPI.",
    category: "AI/ML",
    tags: ["Python", "Machine Learning", "scikit-learn", "Data Science", "AI", "FastAPI"],
    status: "published",
    content: `<h2>What is a Machine Learning Pipeline?</h2>
<p>An ML pipeline is a structured, repeatable sequence of steps that transforms raw data into actionable predictions. A well-designed pipeline is reproducible, testable, and deployable. It's the difference between a one-off notebook experiment and production-quality machine learning.</p>
<h2>Step 1: Data Collection and Exploration</h2>
<p>The first step is understanding your data. Use pandas for data manipulation and matplotlib/seaborn for visualisation. Check for missing values, outliers, class imbalances, and correlations between features. Data exploration is the foundation of every successful ML project.</p>
<h2>Step 2: Feature Engineering</h2>
<p>Raw data is rarely ready for a model. Feature engineering transforms data into representations that algorithms can learn from. This includes encoding categorical variables, normalising numerical features, creating interaction features, and handling missing values with appropriate imputation strategies.</p>
<pre><code>from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.impute import SimpleImputer

preprocessor = Pipeline([
    ('imputer', SimpleImputer(strategy='median')),
    ('scaler', StandardScaler()),
])</code></pre>
<h2>Step 3: Model Selection and Training</h2>
<p>scikit-learn's unified API makes it easy to experiment with multiple models: Logistic Regression, Random Forests, Gradient Boosting, SVMs. Use cross-validation to get reliable performance estimates. Avoid evaluating on your training data — it gives an overly optimistic picture.</p>
<h2>Step 4: Deployment with FastAPI</h2>
<p>Once your model is trained and evaluated, wrap it in a FastAPI endpoint. Serialise the trained pipeline with <code>joblib</code>, load it on startup, and expose a <code>POST /predict</code> endpoint. FastAPI automatically generates interactive documentation and handles request validation.</p>
<h2>Conclusion</h2>
<p>Building ML pipelines requires equal parts data intuition, software engineering discipline, and statistical knowledge. Start small, iterate fast, and always keep your eye on the real-world business metric you're trying to improve.</p>`,
  },
  {
    title: "Mastering Async JavaScript: Promises, async/await, and the Event Loop",
    excerpt:
      "A deep dive into JavaScript's asynchronous model — from callbacks to Promises to async/await — with a clear explanation of the event loop and microtask queue.",
    category: "Tutorial",
    tags: ["JavaScript", "Async", "Promises", "Event Loop", "Node.js", "Frontend"],
    status: "published",
    content: `<h2>JavaScript is Single-Threaded</h2>
<p>JavaScript runs on a single thread, meaning only one piece of code executes at a time. Yet it handles thousands of concurrent operations — network requests, file reads, timers — without blocking. The secret is the <strong>event loop</strong>, one of the most important concepts in JavaScript.</p>
<h2>The Event Loop Explained</h2>
<p>The event loop continuously checks two queues: the <strong>macrotask queue</strong> (setTimeout, setInterval, I/O callbacks) and the <strong>microtask queue</strong> (Promises, queueMicrotask). Microtasks are always processed before macrotasks, and the entire microtask queue is drained before the next macrotask executes.</p>
<h2>From Callbacks to Promises</h2>
<p>Callbacks were the original solution for async code, but they led to "callback hell" — deeply nested, hard-to-read code. Promises flattened this structure by representing an eventual value. Promise chaining with <code>.then()</code> made sequential async operations readable.</p>
<h2>async/await: Syntactic Sugar over Promises</h2>
<p>The <code>async/await</code> keywords, introduced in ES2017, are syntactic sugar over Promises. They let you write async code that looks synchronous, dramatically improving readability. Under the hood, every <code>async</code> function returns a Promise, and <code>await</code> pauses execution until the Promise resolves.</p>
<pre><code>async function fetchUserPosts(userId) {
  try {
    const user = await User.findById(userId);
    const posts = await Post.find({ author: userId });
    return { user, posts };
  } catch (error) {
    throw new Error('Failed to fetch data');
  }
}</code></pre>
<h2>Parallel Execution with Promise.all</h2>
<p>Running async operations sequentially with <code>await</code> is often slower than necessary. When operations are independent, run them in parallel with <code>Promise.all()</code>. It resolves when all promises resolve, or rejects immediately if any promise rejects.</p>
<h2>Conclusion</h2>
<p>Mastering JavaScript's async model is essential for building performant applications. With a clear mental model of the event loop, you can write code that is both correct and efficient — and debug async issues with confidence.</p>`,
  },
];

// ---------------------------------------------------------------------------
// Main seed function
// ---------------------------------------------------------------------------
const seed = async () => {
  try {
    // Connect to MongoDB
    console.log("🔌  Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅  Connected.\n");

    // --- Create admin user if no users exist ---
    let adminUser = await User.findOne({ email: ADMIN.email });

    if (!adminUser) {
      console.log("👤  No users found. Creating admin user...");
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(ADMIN.password, salt);

      adminUser = await User.create({
        name: ADMIN.name,
        email: ADMIN.email,
        password: hashedPassword,
        role: ADMIN.role,
        isVerified: ADMIN.isVerified,
        bio: ADMIN.bio,
      });

      console.log(`   ✅  Admin user created: ${ADMIN.email} / ${ADMIN.password}`);
    } else {
      console.log(`   ℹ️   Admin user already exists: ${ADMIN.email}`);
    }

    // --- Seed posts if none exist ---
    const postCount = await Post.countDocuments();
    if (postCount > 0) {
      console.log(`\n📝  ${postCount} posts already exist. Skipping post seed.`);
    } else {
      console.log("\n📝  Creating 12 tech blog posts...");

      for (const [index, postData] of POSTS.entries()) {
        const post = await Post.create({
          ...postData,
          author: adminUser._id,
        });
        console.log(`   [${index + 1}/12] ✅  "${post.title}" (slug: ${post.slug})`);
      }

      console.log("\n🎉  All posts created successfully!");
    }

    console.log("\n🌱  Seed complete. Disconnecting...");
    await mongoose.disconnect();
    console.log("✅  Disconnected from MongoDB.");
    process.exit(0);
  } catch (error) {
    console.error("\n❌  Seed failed:", error.message);
    console.error(error);
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  }
};

// Run the seed
seed();