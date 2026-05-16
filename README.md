# Go Start Hub

A platform for young innovators and students to display and showcase their prototypes for funds and mentorship from businesses around the Malaysia market.

## Features

- **Prototype Showcase**: Students can display their innovative prototypes
- **Mentorship Matching**: Connect students with industry mentors
- **Funding Opportunities**: Access to funding from businesses and investors
- **Business Connections**: Network with Malaysian businesses
- **Innovator Profiles**: Create and manage innovator profiles

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Backend**: Next.js API Routes
- **Storage**: Local storage (for development)
- **Styling**: Tailwind CSS

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js** (version 18.x or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **Git** (for cloning the repository) - [Download here](https://git-scm.com/)

## Installation & Setup

### Step 1: Clone the Repository

You can download the code in two ways:

**Option A: Using Git (Recommended)**
```bash
git clone https://github.com/tcliang02/GoStartHub.git
cd GoStartHub
```

**Option B: Download as ZIP**
1. Go to https://github.com/tcliang02/GoStartHub
2. Click the green "Code" button
3. Select "Download ZIP"
4. Extract the ZIP file to your desired location
5. Open a terminal in the extracted folder

### Step 2: Install Dependencies

Navigate to the project directory and install all required packages:

```bash
npm install
```

This will install all the dependencies listed in `package.json`.

### Step 3: Run the Development Server

Start the development server:

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

Open your browser and navigate to `http://localhost:3000` to see the application.

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run start` - Start the production server (requires `npm run build` first)
- `npm run lint` - Run ESLint to check for code issues

## Production Build

To create a production build:

```bash
npm run build
npm run start
```

The production build will be optimized and ready for deployment.

## Project Structure

```
Go Start Hub/
├── app/                 # Next.js app directory (pages and API routes)
│   ├── api/            # API endpoints
│   ├── businesses/     # Business pages
│   ├── events/         # Event pages
│   ├── funding/        # Funding pages
│   └── ...
├── components/         # React components
│   └── ui/            # Reusable UI components
├── lib/               # Utilities and data management
├── public/            # Static assets (images, etc.)
├── types/             # TypeScript type definitions
└── package.json       # Project dependencies
```

## Troubleshooting

### Port Already in Use
If port 3000 is already in use, you can specify a different port:
```bash
npm run dev -- -p 3001
```

### Node Version Issues
Make sure you're using Node.js 18.x or higher. Check your version:
```bash
node --version
```

### Installation Issues
If you encounter issues during `npm install`, try:
```bash
npm cache clean --force
npm install
```

## Contributing

Feel free to fork this repository and submit pull requests for any improvements.

## License

This project is private and proprietary.

## Support

For issues or questions, please open an issue on the GitHub repository.

