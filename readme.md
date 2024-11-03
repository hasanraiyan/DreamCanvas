
# Dream Canvas

Welcome to Dream Canvas, a React application that transforms your imagination into stunning visuals using AI-powered image generation.

## Table of Contents

- [Features](#features)
- [Demo](#demo)
- [Installation](#installation)
- [Usage](#usage)
- [Customization](#customization)
- [Technologies Used](#technologies-used)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgements](#acknowledgements)

## Features

- **AI Image Generation**: Turn text prompts into captivating images using AI.
- **Dark Mode**: Toggle between light and dark themes.
- **Advanced Settings**: Fine-tune image parameters like dimensions, seed, and model.
- **History Tracking**: Keep track of generated images and related metadata.
- **Image Download**: Easily download your created images.
- **Responsive Design**: Mobile-friendly and adaptable to various screen sizes.

## Demo

![Dream Canvas Demo](demo/demo.gif)  
A quick demonstration of Dream Canvas in action.

## Installation

To set up Dream Canvas locally, follow these steps:

1. Clone the repository:

   ```bash
   git clone https://github.com/hasanraiyan/DreamCanvas.git
   cd dream-canvas
   ```

2. Install the dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm start
   ```

4. Open your browser and navigate to [http://localhost:5173](http://localhost:5173) to see the app in action.

## Usage

1. Enter a text prompt describing the image you want to generate.
2. Use the advanced settings for more control over image generation.
3. Click the "Generate" button to create images.
4. View and download your generated images.

## Customization

Modify the settings in `App.tsx` to customize the default image generation behavior, such as changing dimensions, seed values, or model type. You'll find these settings in the `useState` hook initialization for the `settings` state.

## Technologies Used

- React
- Typescript
- Framer Motion
- React Toastify
- Tailwind CSS
- Lucide Icons

## Contributing

Contributions are welcome! Follow these steps to contribute:

1. Fork the repository.
2. Create a new branch for your feature or bug fix:

   ```bash
   git checkout -b feature-name
   ```

3. Commit your changes and push them to your forked repository.
4. Create a pull request with a detailed description of your changes.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

## Acknowledgements

- Pollinations for AI image generation.
- Iconography by Lucide.
- Design inspiration from various sources on Dribbble.

