use eframe::egui;

fn main() -> Result<(), eframe::Error> {
    // 最小限の設定でウィンドウを起動
    let options = eframe::NativeOptions {
        viewport: egui::ViewportBuilder::default()
            .with_inner_size([800.0, 600.0])
            .with_title("Lightning MindMap - v0.1.0"),
        ..Default::default()
    };
    
    eframe::run_native(
        "Lightning MindMap",
        options,
        Box::new(|_cc| Box::new(MindMapApp::default())),
    )
}

// ノードの基本構造
#[derive(Debug, Clone)]
struct Node {
    id: usize,
    text: String,
    position: egui::Pos2,
    parent_id: Option<usize>,  // 親ノードのID（ルートはNone）
}

struct MindMapApp {
    nodes: Vec<Node>,
    next_id: usize,  // 次に割り当てるノードID
    selected_node: Option<usize>,  // 選択中のノードID
    editing_node: Option<usize>,  // 編集中のノードID
    edit_text: String,  // 編集中のテキスト（一時バッファ）
    last_click_time: Option<std::time::Instant>,  // ダブルクリック検出用
    last_clicked_node: Option<usize>,  // 最後にクリックしたノード
    dragging_node: Option<usize>,  // ドラッグ中のノードID
    drag_offset: egui::Vec2,  // ドラッグ開始時のオフセット
}

impl Default for MindMapApp {
    fn default() -> Self {
        // 初期状態：ルートノードを1つ作成
        let root_node = Node {
            id: 0,
            text: "Root Node".to_string(),
            position: egui::Pos2::new(400.0, 300.0),
            parent_id: None,
        };
        
        Self {
            nodes: vec![root_node],
            next_id: 1,
            selected_node: None,
            editing_node: None,
            edit_text: String::new(),
            last_click_time: None,
            last_clicked_node: None,
            dragging_node: None,
            drag_offset: egui::Vec2::ZERO,
        }
    }
}

impl MindMapApp {
    // 矢印キーによるノード選択移動
    fn select_nearby_node(&mut self, direction: egui::Vec2) {
        if let Some(current_id) = self.selected_node {
            if let Some(current_node) = self.nodes.iter().find(|n| n.id == current_id) {
                let mut best_node_id: Option<usize> = None;
                let mut best_distance = f32::INFINITY;
                
                for node in &self.nodes {
                    if node.id == current_id {
                        continue;
                    }
                    
                    let delta = node.position - current_node.position;
                    
                    // 指定方向にあるノードのみを対象とする
                    let dot_product = delta.x * direction.x + delta.y * direction.y;
                    if dot_product <= 0.0 {
                        continue;
                    }
                    
                    let distance = delta.length();
                    
                    // 方向性を考慮した距離計算
                    let angle_penalty = 1.0 - (dot_product / distance).abs();
                    let adjusted_distance = distance * (1.0 + angle_penalty);
                    
                    if adjusted_distance < best_distance {
                        best_distance = adjusted_distance;
                        best_node_id = Some(node.id);
                    }
                }
                
                if let Some(new_id) = best_node_id {
                    self.selected_node = Some(new_id);
                }
            }
        } else if !self.nodes.is_empty() {
            // 何も選択されていない場合は最初のノードを選択
            self.selected_node = Some(self.nodes[0].id);
        }
    }
}

impl eframe::App for MindMapApp {
    fn update(&mut self, ctx: &egui::Context, _frame: &mut eframe::Frame) {
        egui::CentralPanel::default().show(ctx, |ui| {
            ui.heading("Lightning MindMap 🚀");
            ui.separator();
            
            // コントロールパネル
            ui.horizontal(|ui| {
                if ui.button("Add Node").clicked() {
                    // 新しいノードを追加
                    let new_node = Node {
                        id: self.next_id,
                        text: format!("Node {}", self.next_id),
                        position: egui::Pos2::new(
                            200.0 + (self.next_id as f32 * 100.0) % 400.0,
                            200.0 + (self.next_id as f32 * 50.0) % 200.0,
                        ),
                        parent_id: self.selected_node,
                    };
                    self.nodes.push(new_node);
                    self.next_id += 1;
                }
                
                ui.separator();
                ui.label(format!("Nodes: {}", self.nodes.len()));
                if let Some(selected) = self.selected_node {
                    ui.label(format!("Selected: Node {}", selected));
                }
                
                ui.separator();
                ui.label("⌨️ Shortcuts: Tab=Add Child, Del=Delete, F2=Edit, ←↑↓→=Select");
            });
            
            ui.separator();
            
            // キャンバス領域
            let canvas_response = ui.allocate_response(
                ui.available_size(),
                egui::Sense::click_and_drag(),
            );
            
            // イベント処理の準備
            let clicked = canvas_response.clicked();
            let dragged = canvas_response.dragged();
            let drag_started = canvas_response.drag_started();
            let drag_released = canvas_response.drag_released();
            let pointer_pos = canvas_response.interact_pointer_pos();
            
            // まず接続線を描画
            {
                let painter = ui.painter();
                for node in &self.nodes {
                    if let Some(parent_id) = node.parent_id {
                        if let Some(parent) = self.nodes.iter().find(|n| n.id == parent_id) {
                            painter.line_segment(
                                [parent.position, node.position],
                                egui::Stroke::new(1.0, egui::Color32::GRAY),
                            );
                        }
                    }
                }
            }
            
            // クリック処理用の変数
            let mut clicked_node: Option<usize> = None;
            
            // ノードを描画
            for (_index, node) in self.nodes.iter_mut().enumerate() {
                let node_id = node.id;
                let node_rect = egui::Rect::from_center_size(
                    node.position,
                    egui::Vec2::new(100.0, 40.0),
                );
                
                // 編集モードのチェック
                if Some(node_id) == self.editing_node {
                    // 編集モード: TextEditを表示
                    ui.painter().rect_filled(
                        node_rect,
                        egui::Rounding::same(5.0),
                        egui::Color32::from_rgb(120, 170, 220),
                    );
                    
                    // TextEditウィジェットを配置
                    let edit_rect = egui::Rect::from_center_size(
                        node.position,
                        egui::Vec2::new(90.0, 25.0),
                    );
                    
                    ui.allocate_ui_at_rect(edit_rect, |ui| {
                        let response = ui.add(
                            egui::TextEdit::singleline(&mut self.edit_text)
                                .desired_width(90.0)
                                .font(egui::TextStyle::Body)
                        );
                        
                        // Enterで編集完了
                        if response.lost_focus() && ui.input(|i| i.key_pressed(egui::Key::Enter)) {
                            node.text = self.edit_text.clone();
                            self.editing_node = None;
                            self.edit_text.clear();
                        }
                        // Escでキャンセル
                        if ui.input(|i| i.key_pressed(egui::Key::Escape)) {
                            self.editing_node = None;
                            self.edit_text.clear();
                        }
                        
                        // 自動フォーカス
                        if response.has_focus() == false {
                            response.request_focus();
                        }
                    });
                } else {
                    // 通常モード: ノードを描画
                    let node_color = if Some(node_id) == self.selected_node {
                        egui::Color32::from_rgb(100, 150, 200)
                    } else {
                        egui::Color32::from_rgb(70, 70, 70)
                    };
                    
                    let painter = ui.painter();
                    painter.rect_filled(
                        node_rect,
                        egui::Rounding::same(5.0),
                        node_color,
                    );
                    
                    // ノードのテキスト
                    painter.text(
                        node.position,
                        egui::Align2::CENTER_CENTER,
                        &node.text,
                        egui::FontId::default(),
                        egui::Color32::WHITE,
                    );
                }
                
                // クリック判定とドラッグ開始判定
                if let Some(pos) = pointer_pos {
                    if node_rect.contains(pos) {
                        if clicked && !dragged {
                            // 純粋なクリック（ドラッグではない）
                            clicked_node = Some(node_id);
                        } else if drag_started {
                            // ドラッグ開始
                            if Some(node_id) == self.selected_node && self.editing_node.is_none() {
                                self.dragging_node = Some(node_id);
                                self.drag_offset = pos - node.position;
                            }
                        }
                    }
                }
                
                // ドラッグ中の処理
                if Some(node_id) == self.dragging_node && dragged {
                    if let Some(pos) = pointer_pos {
                        node.position = pos - self.drag_offset;
                    }
                }
            }
            
            // クリックされたノードの処理（ループの後で処理）
            if let Some(node_id) = clicked_node {
                let now = std::time::Instant::now();
                
                // ダブルクリック検出
                if let Some(last_time) = self.last_click_time {
                    if self.last_clicked_node == Some(node_id) 
                        && now.duration_since(last_time).as_millis() < 500 {
                        // ダブルクリック: 編集モード開始
                        self.editing_node = Some(node_id);
                        if let Some(node) = self.nodes.iter().find(|n| n.id == node_id) {
                            self.edit_text = node.text.clone();
                        }
                        self.last_click_time = None;
                        self.last_clicked_node = None;
                    } else {
                        // シングルクリック: 選択
                        self.selected_node = Some(node_id);
                        self.last_click_time = Some(now);
                        self.last_clicked_node = Some(node_id);
                    }
                } else {
                    // 初回クリック
                    self.selected_node = Some(node_id);
                    self.last_click_time = Some(now);
                    self.last_clicked_node = Some(node_id);
                }
            } else if clicked && !dragged {
                // 空白をクリックした場合は選択解除（ドラッグでない場合のみ）
                self.selected_node = None;
                self.last_click_time = None;
                self.last_clicked_node = None;
            }
            
            // ドラッグ終了処理
            if drag_released {
                self.dragging_node = None;
                self.drag_offset = egui::Vec2::ZERO;
            }
            
            // キーボードショートカット処理（編集モードでない場合のみ）
            if self.editing_node.is_none() {
                ui.input(|i| {
                    // Tab: 子ノードを追加
                    if i.key_pressed(egui::Key::Tab) {
                        if let Some(selected_id) = self.selected_node {
                            let selected_pos = self.nodes.iter()
                                .find(|n| n.id == selected_id)
                                .map(|n| n.position)
                                .unwrap_or(egui::Pos2::new(400.0, 300.0));
                            
                            let new_node = Node {
                                id: self.next_id,
                                text: format!("Node {}", self.next_id),
                                position: egui::Pos2::new(
                                    selected_pos.x + 150.0,
                                    selected_pos.y + 80.0,
                                ),
                                parent_id: Some(selected_id),
                            };
                            self.nodes.push(new_node);
                            self.selected_node = Some(self.next_id);
                            self.next_id += 1;
                        }
                    }
                    
                    // Delete: ノードを削除（ルートノードは保護）
                    if i.key_pressed(egui::Key::Delete) {
                        if let Some(selected_id) = self.selected_node {
                            if selected_id != 0 { // ルートノード（ID: 0）は削除不可
                                // 削除対象ノードの子ノードも一緒に削除
                                let mut nodes_to_remove = vec![selected_id];
                                let mut i = 0;
                                while i < nodes_to_remove.len() {
                                    let parent_id = nodes_to_remove[i];
                                    for node in &self.nodes {
                                        if node.parent_id == Some(parent_id) {
                                            nodes_to_remove.push(node.id);
                                        }
                                    }
                                    i += 1;
                                }
                                
                                // ノードを削除
                                self.nodes.retain(|n| !nodes_to_remove.contains(&n.id));
                                self.selected_node = None;
                            }
                        }
                    }
                    
                    // F2: 編集モード開始
                    if i.key_pressed(egui::Key::F2) {
                        if let Some(selected_id) = self.selected_node {
                            self.editing_node = Some(selected_id);
                            if let Some(node) = self.nodes.iter().find(|n| n.id == selected_id) {
                                self.edit_text = node.text.clone();
                            }
                        }
                    }
                    
                    // 矢印キーでノード選択移動
                    if i.key_pressed(egui::Key::ArrowUp) {
                        self.select_nearby_node(egui::Vec2::new(0.0, -1.0));
                    }
                    if i.key_pressed(egui::Key::ArrowDown) {
                        self.select_nearby_node(egui::Vec2::new(0.0, 1.0));
                    }
                    if i.key_pressed(egui::Key::ArrowLeft) {
                        self.select_nearby_node(egui::Vec2::new(-1.0, 0.0));
                    }
                    if i.key_pressed(egui::Key::ArrowRight) {
                        self.select_nearby_node(egui::Vec2::new(1.0, 0.0));
                    }
                });
            }
            
            ui.separator();
            
            // パフォーマンス情報の表示
            ui.horizontal(|ui| {
                ui.label(format!("FPS: {:.1}", 1.0 / ctx.input(|i| i.unstable_dt)));
                ui.label(format!("Frame time: {:.2}ms", ctx.input(|i| i.unstable_dt * 1000.0)));
            });
        });
    }
}
