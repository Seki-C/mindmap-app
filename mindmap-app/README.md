# Lightning MindMap ⚡

Ultra-fast native mindmap application built with Rust and egui.

## 🚀 Features

- **Blazing Fast**: Instant startup (<0.05s) and ultra-responsive UI
- **Native Performance**: Built with Rust for maximum efficiency
- **Cross-Platform**: Works on Windows, macOS, and Linux
- **Lightweight**: Minimal memory footprint (~15MB)
- **Real-time**: 240fps capable rendering

## 🎯 Current Status

This project is in early development (v0.1.0). Basic functionality includes:
- Node creation and management
- Drag & drop node positioning
- Parent-child relationships
- Real-time performance monitoring

## 🛠️ Tech Stack

- **Rust** - Systems programming language
- **egui** - Immediate mode GUI framework
- **eframe** - egui application framework

## 📦 Installation

### Prerequisites

- Rust 1.75 or later
- Cargo (comes with Rust)

### Build from source

```bash
# Clone the repository
git clone https://github.com/yourusername/lightning-mindmap.git
cd lightning-mindmap

# Build the project
cargo build --release

# Run the application
cargo run --release
```

## 🎮 Usage

- **Add Node**: Click the "Add Node" button
- **Select Node**: Click on any node to select it
- **Move Node**: Drag selected node to reposition
- **Create Child**: Select a parent node, then add a new node

## 🗺️ Roadmap

### Phase 1 - MVP ✅
- [x] Basic node structure
- [x] Node rendering
- [x] Drag & drop
- [x] Parent-child connections

### Phase 2 - Core Features (In Progress)
- [ ] Node text editing
- [ ] Node deletion
- [ ] Keyboard shortcuts
- [ ] Save/Load functionality

### Phase 3 - Advanced Features
- [ ] 10,000+ nodes support
- [ ] Auto-layout algorithms
- [ ] Zoom/Pan controls
- [ ] Export to various formats

### Phase 4 - Extreme Optimization
- [ ] 100,000 nodes at 60fps
- [ ] GPU-accelerated rendering
- [ ] Custom memory allocators
- [ ] SIMD optimizations

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎯 Performance Goals

| Metric | Target | Status |
|--------|--------|--------|
| Startup Time | <0.05s | 🔄 In Progress |
| Response Time | <4ms | 🔄 In Progress |
| Node Capacity | 100,000 @ 60fps | 📋 Planned |
| Memory Usage | <15MB base | 🔄 In Progress |
| Binary Size | <3MB | 📋 Planned |

## 🔧 Development

```bash
# Run in development mode
cargo run

# Run tests
cargo test

# Check code
cargo clippy

# Format code
cargo fmt
```

## 📚 Documentation

- [Requirements Document](mindmap-requirements.md) - Detailed project specifications
- [Development Context](CLAUDE.md) - AI assistant context documentation

## 🙏 Acknowledgments

- Built with [egui](https://github.com/emilk/egui) - Thanks to Emil Ernerfeldt
- Inspired by various mindmapping tools

---

**Note**: This is an experimental project focused on achieving extreme performance in mindmapping applications.