import React from 'react';
import { View, Text, StyleSheet, Image, SafeAreaView, StatusBar, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { captureRef } from 'react-native-view-shot';
import { Platform } from 'react-native';

type ShapeType = 'rect' | 'ellipse' | 'diamond' | 'text';
interface Shape {
  id: string;
  type: ShapeType;
  x: number;
  y: number;
  width?: number;
  height?: number;
  scale?: number;
  text?: string;
}

const exampleShapes: Shape[] = [
  { id: 's1', type: 'ellipse', x: 210, y: 60, text: 'Start', scale: 1 },
  { id: 's2', type: 'rect', x: 200, y: 160, text: 'Step 1', scale: 1 },
  { id: 's3', type: 'diamond', x: 200, y: 260, text: 'Decision?', scale: 1 },
  { id: 's4', type: 'rect', x: 80, y: 360, text: 'Option A', scale: 1 },
  { id: 's5', type: 'rect', x: 320, y: 360, text: 'Option B', scale: 1 },
  { id: 's6', type: 'ellipse', x: 200, y: 460, text: 'End', scale: 1 },
];

const exampleConnectors: Connector[] = [
  { from: 's1', to: 's2' },
  { from: 's2', to: 's3' },
  { from: 's3', to: 's4' },
  { from: 's3', to: 's5' },
  { from: 's4', to: 's6' },
  { from: 's5', to: 's6' },
];

const initialShapes: Shape[] = [];

import Svg, { Line as SvgLine } from 'react-native-svg';

interface Connector { from: string; to: string; }

export default function MirrorScreen() {
  const canvasRef = React.useRef<View>(null);

  // Save diagram as PNG (mobile) or JSON (web)
  const handleSave = async () => {
    if (Platform.OS === 'web') {
      // Export as JSON
      const data = JSON.stringify({ shapes, connectors }, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `figmine-diagram-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      alert('Diagram exported as JSON!');
      return;
    }
    // Native: PNG
    try {
      if (!canvasRef.current) {
        alert('Canvas not ready');
        return;
      }
      const uri = await captureRef(canvasRef.current, { format: 'png', quality: 0.95 });
      const fileName = `figmine-diagram-${Date.now()}.png`;
      const tempPath = FileSystem.cacheDirectory + fileName;
      await FileSystem.copyAsync({ from: uri, to: tempPath });
      const res = await DocumentPicker.getDocumentAsync({
        type: 'image/png',
        copyToCacheDirectory: false,
        multiple: false,
      });
      if (res.assets && res.assets.length > 0 && res.assets[0].uri) {
        const destUri = res.assets[0].uri;
        await FileSystem.copyAsync({ from: tempPath, to: destUri });
        alert('Diagram saved to: ' + destUri);
      } else if (res.canceled) {
        alert('Save cancelled.');
      } else {
        alert('No file selected.');
      }
    } catch (e) {
      if (e instanceof Error) {
        alert('Failed to save: ' + e.message);
      } else {
        alert('Failed to save.');
      }
    }
  };

  // Share diagram as PNG (mobile) or JSON (web)
  const handleShare = async () => {
    if (Platform.OS === 'web') {
      // Export as JSON and trigger download
      const data = JSON.stringify({ shapes, connectors }, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `figmine-diagram-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      alert('Diagram exported as JSON!');
      return;
    }
    // Native: PNG
    try {
      if (!canvasRef.current) {
        alert('Canvas not ready');
        return;
      }
      const uri = await captureRef(canvasRef.current, { format: 'png', quality: 0.95 });
      await Sharing.shareAsync(uri);
    } catch (e) {
      if (e instanceof Error) {
        alert('Failed to share: ' + e.message);
      } else {
        alert('Failed to share.');
      }
    }
  };


  const router = useRouter();
  const params = useLocalSearchParams();
  // Detect if opened from flowchart template (e.g. via params)
  const [shapes, setShapes] = React.useState<Shape[]>([]);
  const [connectors, setConnectors] = React.useState<Connector[]>([]);

  // Only show example when navigating from Flowchart Template
  React.useEffect(() => {
    if (params && params.fromFlowchart) {
      setShapes([...exampleShapes]);
      setConnectors([...exampleConnectors]);
    } else if (!params || Object.keys(params).length === 0) {
      setShapes([]);
      setConnectors([]);
    }
    // If params exist but not fromFlowchart, don't reset shapes/connectors (preserve user work)
  }, [params && params.fromFlowchart, params]);
  const [tool, setTool] = React.useState<'select'|'line'>('select');
  const [pendingLine, setPendingLine] = React.useState<string|null>(null);
  const [selectedId, setSelectedId] = React.useState<string|null>(null);
  const [textModal, setTextModal] = React.useState<{visible: boolean, id: string|null}>({visible: false, id: null});
  const [editText, setEditText] = React.useState('');

  const addShape = (type: ShapeType) => {
    setShapes(prev => [
      ...prev,
      {
        id: Math.random().toString(36).substr(2, 9),
        type,
        x: 100 + Math.random() * 100,
        y: 180 + Math.random() * 100,
        text: type === 'text' ? 'Text' : type.charAt(0).toUpperCase() + type.slice(1)
      }
    ]);
  };
  const updateShape = (id: string, x: number, y: number) => {
    setShapes(prev => prev.map(s => s.id === id ? { ...s, x, y } : s));
  };
  const updateShapeSize = (id: string, delta: number) => {
    setShapes(prev => prev.map(s => s.id === id ? { ...s, scale: (s.scale || 1) + delta > 0.3 ? (s.scale || 1) + delta : 0.3 } : s));
  };
  const deleteShape = (id: string) => {
    setShapes(prev => prev.filter(s => s.id !== id));
    if(selectedId === id) setSelectedId(null);
  };
  const openTextModal = (id: string, currentText: string) => {
    setEditText(currentText);
    setTextModal({visible: true, id});
  };
  const saveText = () => {
    if(textModal.id)
      setShapes(prev => prev.map(s => s.id === textModal.id ? { ...s, text: editText } : s));
    setTextModal({visible: false, id: null});
  };

  interface DraggableShapeProps {
    shape: Shape;
    onUpdate: (id: string, x: number, y: number) => void;
    onTap?: (id: string) => void;
  }

  function DraggableShape({ shape, onUpdate, onTap }: DraggableShapeProps) {
    const [dragging, setDragging] = React.useState(false);
    const [startX, setStartX] = React.useState(0);
    const [startY, setStartY] = React.useState(0);
    const [initialX, setInitialX] = React.useState(shape.x);
    const [initialY, setInitialY] = React.useState(shape.y);
    const scale = shape.scale || 1;
    const isSelected = selectedId === shape.id;

    React.useEffect(() => {
      setInitialX(shape.x);
      setInitialY(shape.y);
    }, [shape.x, shape.y]);

    return (
      <View
        style={{
          position: 'absolute',
          left: shape.x,
          top: shape.y,
          zIndex: dragging ? 2 : 1,
          transform: [{ scale }],
        }}
        onStartShouldSetResponder={() => true}
        onResponderGrant={e => {
          setDragging(true);
          setStartX(e.nativeEvent.pageX);
          setStartY(e.nativeEvent.pageY);
          setInitialX(shape.x);
          setInitialY(shape.y);
        }}
        onResponderMove={e => {
          const dx = e.nativeEvent.pageX - startX;
          const dy = e.nativeEvent.pageY - startY;
          onUpdate(shape.id, initialX + dx, initialY + dy);
        }}
        onResponderRelease={e => {
          setDragging(false);
          const moved = Math.abs(e.nativeEvent.pageX - startX) + Math.abs(e.nativeEvent.pageY - startY);
          if (moved < 10) {
            if (onTap) onTap(shape.id);
          }
        }}
      >
        {/* Controls if selected */}
        {isSelected && (
          <View style={{ flexDirection: 'row', position: 'absolute', top: -36, left: 0, zIndex: 10 }}>
            <TouchableOpacity style={styles.ctrlBtn} onPress={() => updateShapeSize(shape.id, 0.15)}><Text style={styles.ctrlText}>＋</Text></TouchableOpacity>
            <TouchableOpacity style={styles.ctrlBtn} onPress={() => updateShapeSize(shape.id, -0.15)}><Text style={styles.ctrlText}>－</Text></TouchableOpacity>
            {(shape.type === 'text' || shape.type === 'rect' || shape.type === 'ellipse' || shape.type === 'diamond') && (
              <TouchableOpacity style={styles.ctrlBtn} onPress={() => openTextModal(shape.id, shape.text || '')}><Text style={styles.ctrlText}>✏️</Text></TouchableOpacity>
            )}
            <TouchableOpacity style={styles.ctrlBtn} onPress={() => deleteShape(shape.id)}><Text style={styles.ctrlText}>🗑️</Text></TouchableOpacity>
          </View>
        )}
        {shape.type === 'rect' && (
          <TouchableOpacity activeOpacity={0.8} onPress={() => onTap && onTap(shape.id)}>
            <View style={{ width: 90, height: 50, backgroundColor: '#b3e5fc', borderRadius: 8, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#0288d1' }}>
              <Text style={{ fontWeight: 'bold', color: '#0288d1' }}>{shape.text}</Text>
            </View>
          </TouchableOpacity>
        )}
        {shape.type === 'ellipse' && (
          <TouchableOpacity activeOpacity={0.8} onPress={() => onTap && onTap(shape.id)}>
            <View style={{ width: 70, height: 70, backgroundColor: '#ffe082', borderRadius: 35, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#ffb300' }}>
              <Text style={{ fontWeight: 'bold', color: '#ffb300' }}>{shape.text}</Text>
            </View>
          </TouchableOpacity>
        )}
        {shape.type === 'diamond' && (
          <TouchableOpacity activeOpacity={0.8} onPress={() => onTap && onTap(shape.id)}>
            <View style={{ width: 60, height: 60, transform: [{ rotate: '45deg' }], backgroundColor: '#c8e6c9', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#388e3c' }}>
              <Text style={{ fontWeight: 'bold', color: '#388e3c', transform: [{ rotate: '-45deg' }] }}>{shape.text}</Text>
            </View>
          </TouchableOpacity>
        )}
        {shape.type === 'text' && (
          <TouchableOpacity activeOpacity={0.8} onPress={() => onTap && onTap(shape.id)}>
            <View style={{ padding: 6, backgroundColor: 'transparent' }}>
              <Text style={{ fontWeight: 'bold', color: '#333', fontSize: 16 }}>{shape.text}</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>
    );
  }
  // Mock user data
  const avatarUrl = null; // Replace with a real URL to test image avatar

  // --- handleShapeTap implementation ---
  const handleShapeTap = (id: string) => {
    if (tool === 'line') {
      if (!pendingLine) {
        setPendingLine(id);
      } else if (pendingLine && pendingLine !== id) {
        setConnectors(prev => [...prev, { from: pendingLine, to: id }]);
        setPendingLine(null);
        setTool('select'); // auto switch back to select
      }
    } else {
      setSelectedId(id);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mirror</Text>
        <TouchableOpacity style={styles.avatarButton} onPress={() => router.push('/settings')}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
          ) : (
            <Ionicons name="person-circle-outline" size={32} color="#00C853" />
          )}
        </TouchableOpacity>
      </View>
      {/* Save Button */}
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', padding: 12 }}>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Ionicons name="save-outline" size={22} color="#3478F6" />
          <Text style={{ marginLeft: 4, color: '#3478F6', fontWeight: 'bold' }}>Save</Text>
        </TouchableOpacity>
      </View>
      {/* Toolbar */}
      <View style={{ flexDirection: 'row', padding: 8, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#eee' }}>
        <TouchableOpacity style={[styles.toolButton, tool==='select'&&{backgroundColor:'#D6E3FF'}]} onPress={() => setTool('select')}><Text style={styles.toolText}>✋</Text></TouchableOpacity>
        <TouchableOpacity style={styles.toolButton} onPress={() => addShape('rect')}><Text style={styles.toolText}>⬛</Text></TouchableOpacity>
        <TouchableOpacity style={styles.toolButton} onPress={() => addShape('ellipse')}><Text style={styles.toolText}>⬤</Text></TouchableOpacity>
        <TouchableOpacity style={styles.toolButton} onPress={() => addShape('diamond')}><Text style={styles.toolText}>◇</Text></TouchableOpacity>
        <TouchableOpacity style={styles.toolButton} onPress={() => addShape('text')}><Text style={styles.toolText}>T</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.toolButton, tool==='line'&&{backgroundColor:'#D6E3FF'}]} onPress={() => setTool('line')}><Text style={styles.toolText}>─</Text></TouchableOpacity>
      </View>
      {/* Canvas */}
      <View style={{ flex: 1 }}>
        {/* SVG Connectors */}
        <Svg style={{position:'absolute',top:0,left:0,width:'100%',height:'100%',zIndex:0}}>
          {connectors.map((c, i) => {
            const from = shapes.find(s=>s.id===c.from);
            const to = shapes.find(s=>s.id===c.to);
            if (!from || !to) return null;
            const getCenter = (shape: Shape) => {
              const w = shape.type==='ellipse'?70:shape.type==='rect'?90:shape.type==='diamond'?60:60;
              const h = shape.type==='ellipse'?70:shape.type==='rect'?50:shape.type==='diamond'?60:30;
              return [ (shape.x+(w/2)*(shape.scale||1)), (shape.y+(h/2)*(shape.scale||1)) ];
            };
            const [x1,y1]=getCenter(from),[x2,y2]=getCenter(to);
            return <SvgLine key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#3478F6" strokeWidth="3" />;
          })}
        </Svg>
        {shapes.map((shape, idx) => (
          <DraggableShape key={shape.id} shape={shape} onUpdate={updateShape} onTap={handleShapeTap} />
        ))}
      </View>
      {/* Text Edit Modal */}
      {textModal.visible && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 8 }}>Edit Text</Text>
            <TextInput
              style={styles.textInput}
              value={editText}
              onChangeText={setEditText}
              autoFocus
            />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 }}>
              <TouchableOpacity onPress={saveText} style={[styles.ctrlBtn, {marginRight: 8}]}><Text style={styles.ctrlText}>Save</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => setTextModal({visible: false, id: null})} style={styles.ctrlBtn}><Text style={styles.ctrlText}>Cancel</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
} 

const styles = StyleSheet.create({
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F0FF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginLeft: 10,
  },
  ctrlBtn: {
    backgroundColor: '#fff',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginHorizontal: 2,
    borderWidth: 1,
    borderColor: '#bbb',
    elevation: 2,
  },
  ctrlText: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
  },
  modalOverlay: {
    position: 'absolute',
    left: 0, top: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.20)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  modalBox: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 24,
    width: 260,
    shadowColor: '#000',
    shadowOpacity: 0.16,
    shadowRadius: 8,
    elevation: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 8,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    marginBottom: 6,
  },
  toolButton: {
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
    padding: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  toolText: {
    fontSize: 20,
    color: '#333',
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: StatusBar.currentHeight || 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
  },
  avatarButton: {
    padding: 0,
  },
  avatarImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    resizeMode: 'cover',
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  illustration: {
    width: 120,
    height: 120,
    marginBottom: 24,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    lineHeight: 20,
  },
});
