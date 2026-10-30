import React, { useState, useCallback, DragEvent } from 'react';
import { Helmet } from 'react-helmet-async';
import {
    ReactFlow,
    Node,
    Edge,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    Connection,
    BackgroundVariant,
    NodeTypes,
    Panel,
    MiniMap,
    Handle,
    Position,
    ConnectionLineType
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import type { FlowchartNodeType, FlowchartData, FlowchartNodeData } from '../types';

// Custom node components with improved styling and connection handles
const StartEndNode: React.FC<{ data: any; id: string; selected?: boolean }> = ({ data, selected }) => (
    <div className={`px-8 py-4 bg-gradient-to-br from-green-400 to-green-600 text-white rounded-full border-3 shadow-xl font-bold text-center min-w-[140px] hover:shadow-2xl transition-all ${selected ? 'ring-4 ring-green-300 ring-offset-2' : ''}`}>
        <Handle 
            type="target" 
            position={Position.Top} 
            className="w-6 h-6 !bg-white !border-4 !border-green-700 hover:!w-8 hover:!h-8 transition-all"
            isConnectable={true}
        />
        {data.label}
        <Handle 
            type="source" 
            position={Position.Bottom} 
            className="w-6 h-6 !bg-white !border-4 !border-green-700 hover:!w-8 hover:!h-8 transition-all"
            isConnectable={true}
        />
    </div>
);

const VariableNode: React.FC<{ data: any; id: string; selected?: boolean }> = ({ data, selected }) => (
    <div className={`px-6 py-4 bg-gradient-to-br from-blue-400 to-blue-600 text-white rounded-xl border-3 shadow-xl min-w-[180px] hover:shadow-2xl transition-all ${selected ? 'ring-4 ring-blue-300 ring-offset-2' : ''}`}>
        <Handle 
            type="target" 
            position={Position.Top} 
            className="w-6 h-6 !bg-white !border-4 !border-blue-700 hover:!w-8 hover:!h-8 transition-all"
            isConnectable={true}
        />
        <div className="font-bold text-center text-lg">{data.label}</div>
        {data.variableName && (
            <div className="text-sm mt-2 text-center opacity-95 font-mono">
                {data.variableName} = {data.variableValue || '?'}
            </div>
        )}
        <Handle 
            type="source" 
            position={Position.Bottom} 
            className="w-6 h-6 !bg-white !border-4 !border-blue-700 hover:!w-8 hover:!h-8 transition-all"
            isConnectable={true}
        />
    </div>
);

const ConditionalNode: React.FC<{ data: any; id: string; selected?: boolean }> = ({ data, selected }) => (
    <div className={`relative px-8 py-6 bg-gradient-to-br from-yellow-400 to-yellow-600 text-white border-3 shadow-xl min-w-[180px] transform rotate-45 hover:shadow-2xl transition-all ${selected ? 'ring-4 ring-yellow-300 ring-offset-2' : ''}`}>
        <Handle 
            type="target" 
            position={Position.Top} 
            className="w-6 h-6 !bg-white !border-4 !border-yellow-700 hover:!w-8 hover:!h-8 transition-all"
            isConnectable={true}
        />
        <div className="transform -rotate-45">
            <div className="font-bold text-center text-base">{data.label}</div>
            {data.condition && (
                <div className="text-sm mt-2 text-center opacity-95 font-mono">{data.condition}</div>
            )}
        </div>
        <Handle 
            type="source" 
            position={Position.Bottom} 
            className="w-6 h-6 !bg-white !border-4 !border-yellow-700 hover:!w-8 hover:!h-8 transition-all"
            isConnectable={true}
        />
    </div>
);

const LoopNode: React.FC<{ data: any; id: string; selected?: boolean }> = ({ data, selected }) => (
    <div className={`px-6 py-4 bg-gradient-to-br from-orange-400 to-orange-600 text-white rounded-xl border-3 shadow-xl min-w-[180px] hover:shadow-2xl transition-all ${selected ? 'ring-4 ring-orange-300 ring-offset-2' : ''}`}>
        <Handle 
            type="target" 
            position={Position.Top} 
            className="w-6 h-6 !bg-white !border-4 !border-orange-700 hover:!w-8 hover:!h-8 transition-all"
            isConnectable={true}
        />
        <div className="font-bold text-center text-lg">{data.label}</div>
        {data.loopType && (
            <div className="text-sm mt-2 text-center opacity-95 font-mono">
                {data.loopType}: {data.loopCondition || '?'}
            </div>
        )}
        <Handle 
            type="source" 
            position={Position.Bottom} 
            className="w-6 h-6 !bg-white !border-4 !border-orange-700 hover:!w-8 hover:!h-8 transition-all"
            isConnectable={true}
        />
    </div>
);

const FunctionNode: React.FC<{ data: any; id: string; selected?: boolean }> = ({ data, selected }) => (
    <div className={`px-6 py-4 bg-gradient-to-br from-purple-400 to-purple-600 text-white rounded-2xl border-3 shadow-xl min-w-[180px] hover:shadow-2xl transition-all ${selected ? 'ring-4 ring-purple-300 ring-offset-2' : ''}`}>
        <Handle 
            type="target" 
            position={Position.Top} 
            className="w-6 h-6 !bg-white !border-4 !border-purple-700 hover:!w-8 hover:!h-8 transition-all"
            isConnectable={true}
        />
        <div className="font-bold text-center text-lg">{data.label}</div>
        {data.functionName && (
            <div className="text-sm mt-2 text-center opacity-95 font-mono">
                {data.functionName}({data.functionArgs || ''})
            </div>
        )}
        <Handle 
            type="source" 
            position={Position.Bottom} 
            className="w-6 h-6 !bg-white !border-4 !border-purple-700 hover:!w-8 hover:!h-8 transition-all"
            isConnectable={true}
        />
    </div>
);

const OutputNode: React.FC<{ data: any; id: string; selected?: boolean }> = ({ data, selected }) => (
    <div className={`px-6 py-4 bg-gradient-to-br from-cyan-400 to-cyan-600 text-white rounded-xl border-3 shadow-xl min-w-[180px] hover:shadow-2xl transition-all ${selected ? 'ring-4 ring-cyan-300 ring-offset-2' : ''}`}>
        <Handle 
            type="target" 
            position={Position.Top} 
            className="w-6 h-6 !bg-white !border-4 !border-cyan-700 hover:!w-8 hover:!h-8 transition-all"
            isConnectable={true}
        />
        <div className="font-bold text-center text-lg">{data.label}</div>
        {data.outputExpression && (
            <div className="text-sm mt-2 text-center opacity-95 font-mono">
                print({data.outputExpression})
            </div>
        )}
        <Handle 
            type="source" 
            position={Position.Bottom} 
            className="w-6 h-6 !bg-white !border-4 !border-cyan-700 hover:!w-8 hover:!h-8 transition-all"
            isConnectable={true}
        />
    </div>
);

const nodeTypes: NodeTypes = {
    start: StartEndNode,
    end: StartEndNode,
    variable: VariableNode,
    conditional: ConditionalNode,
    loop: LoopNode,
    function: FunctionNode,
    output: OutputNode,
};

interface FlowchartBuilderProps {
    onGenerateCode: (flowchart: FlowchartData) => void;
    onClose: () => void;
}

export const FlowchartBuilder: React.FC<FlowchartBuilderProps> = ({ onGenerateCode, onClose }) => {
    const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
    const [nodeIdCounter, setNodeIdCounter] = useState(1);
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);
    const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isEdgeEditModalOpen, setIsEdgeEditModalOpen] = useState(false);
    const [editFormData, setEditFormData] = useState<FlowchartNodeData>({ label: '' });
    const [edgeLabel, setEdgeLabel] = useState('');

    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge({ ...params, type: 'smoothstep', animated: true }, eds)),
        [setEdges]
    );

    const onDragOver = useCallback((event: DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event: DragEvent) => {
            event.preventDefault();

            const type = event.dataTransfer.getData('application/reactflow');
            if (!type) return;

            const reactFlowBounds = (event.target as HTMLElement).getBoundingClientRect();
            const position = {
                x: event.clientX - reactFlowBounds.left - 100,
                y: event.clientY - reactFlowBounds.top - 50,
            };

            const id = `node-${nodeIdCounter}`;
            setNodeIdCounter(nodeIdCounter + 1);

            const newNode: Node = {
                id,
                type: type as FlowchartNodeType,
                position,
                data: {
                    label: type.charAt(0).toUpperCase() + type.slice(1),
                    ...(type === 'start' && { label: 'Start' }),
                    ...(type === 'end' && { label: 'End' }),
                },
            };

            setNodes((nds) => [...nds, newNode]);
        },
        [nodeIdCounter, setNodes]
    );

    const onDragStart = (event: DragEvent, nodeType: FlowchartNodeType) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.effectAllowed = 'move';
    };

    const handleNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
        // Single click just selects the node (handled by React Flow)
        console.log('Node selected:', node.id);
    }, []);

    const handleNodeDoubleClick = useCallback((_event: React.MouseEvent, node: Node) => {
        setSelectedNode(node);
        setEditFormData(node.data as unknown as FlowchartNodeData);
        setIsEditModalOpen(true);
    }, []);

    const handleEdgeClick = useCallback((_event: React.MouseEvent, edge: Edge) => {
        setSelectedEdge(edge);
        setEdgeLabel((edge.label as string) || '');
        setIsEdgeEditModalOpen(true);
    }, []);

    const handleSaveNodeEdit = useCallback(() => {
        if (!selectedNode) return;

        setNodes((nds) =>
            nds.map((node) =>
                node.id === selectedNode.id
                    ? { ...node, data: { ...editFormData } }
                    : node
            )
        );
        setIsEditModalOpen(false);
        setSelectedNode(null);
    }, [selectedNode, editFormData, setNodes]);

    const handleSaveEdgeEdit = useCallback(() => {
        if (!selectedEdge) return;

        setEdges((eds) =>
            eds.map((edge) =>
                edge.id === selectedEdge.id
                    ? { ...edge, label: edgeLabel }
                    : edge
            )
        );
        setIsEdgeEditModalOpen(false);
        setSelectedEdge(null);
    }, [selectedEdge, edgeLabel, setEdges]);

    const handleDeleteNode = useCallback(() => {
        if (!selectedNode) return;
        
        // Remove the node
        setNodes((nds) => nds.filter((node) => node.id !== selectedNode.id));
        
        // Remove any edges connected to this node
        setEdges((eds) => eds.filter((edge) => 
            edge.source !== selectedNode.id && edge.target !== selectedNode.id
        ));
        
        setIsEditModalOpen(false);
        setSelectedNode(null);
    }, [selectedNode, setNodes, setEdges]);

    const handleDeleteEdge = useCallback(() => {
        if (!selectedEdge) return;
        setEdges((eds) => eds.filter((edge) => edge.id !== selectedEdge.id));
        setIsEdgeEditModalOpen(false);
        setSelectedEdge(null);
    }, [selectedEdge, setEdges]);

    const handleClear = useCallback(() => {
        setNodes([]);
        setEdges([]);
        setNodeIdCounter(1);
    }, [setNodes, setEdges]);

    const handleGenerate = useCallback(() => {
        const flowchartData: FlowchartData = {
            nodes: nodes.map(node => ({
                id: node.id,
                type: node.type as FlowchartNodeType,
                data: node.data as unknown as FlowchartNodeData,
                position: node.position
            })),
            edges: edges.map(edge => ({
                id: edge.id,
                source: edge.source,
                target: edge.target,
                label: edge.label as string | undefined
            }))
        };
        console.log('🚀 Generating code from flowchart:', flowchartData);
        onGenerateCode(flowchartData);
    }, [nodes, edges, onGenerateCode]);

    return (
        <div className="flex h-full bg-gray-50 dark:bg-gray-900">
            <Helmet>
                <title>Flowchart Builder</title>
            </Helmet>
            {/* Left Sidebar - Draggable Palette */}
            <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col shadow-lg">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">Node Palette</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Drag nodes onto canvas</p>
                </div>
                
                <div className="flex-1 p-4 space-y-3 overflow-y-auto">
                    <div
                        draggable
                        onDragStart={(e) => onDragStart(e, 'start')}
                        className="p-3 bg-gradient-to-r from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 text-green-800 dark:text-green-300 rounded-lg cursor-move hover:shadow-md transition-shadow border-2 border-green-300 dark:border-green-700"
                    >
                        <div className="font-semibold">○ Start</div>
                        <div className="text-xs opacity-75 mt-1">Program entry point</div>
                    </div>

                    <div
                        draggable
                        onDragStart={(e) => onDragStart(e, 'variable')}
                        className="p-3 bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 text-blue-800 dark:text-blue-300 rounded-lg cursor-move hover:shadow-md transition-shadow border-2 border-blue-300 dark:border-blue-700"
                    >
                        <div className="font-semibold">□ Variable</div>
                        <div className="text-xs opacity-75 mt-1">Assign a value</div>
                    </div>

                    <div
                        draggable
                        onDragStart={(e) => onDragStart(e, 'conditional')}
                        className="p-3 bg-gradient-to-r from-yellow-100 to-yellow-200 dark:from-yellow-900/30 dark:to-yellow-800/30 text-yellow-800 dark:text-yellow-300 rounded-lg cursor-move hover:shadow-md transition-shadow border-2 border-yellow-300 dark:border-yellow-700"
                    >
                        <div className="font-semibold">◇ If/Else</div>
                        <div className="text-xs opacity-75 mt-1">Decision point</div>
                    </div>

                    <div
                        draggable
                        onDragStart={(e) => onDragStart(e, 'loop')}
                        className="p-3 bg-gradient-to-r from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30 text-orange-800 dark:text-orange-300 rounded-lg cursor-move hover:shadow-md transition-shadow border-2 border-orange-300 dark:border-orange-700"
                    >
                        <div className="font-semibold">⬡ Loop</div>
                        <div className="text-xs opacity-75 mt-1">Repeat actions</div>
                    </div>

                    <div
                        draggable
                        onDragStart={(e) => onDragStart(e, 'function')}
                        className="p-3 bg-gradient-to-r from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30 text-purple-800 dark:text-purple-300 rounded-lg cursor-move hover:shadow-md transition-shadow border-2 border-purple-300 dark:border-purple-700"
                    >
                        <div className="font-semibold">▭ Function</div>
                        <div className="text-xs opacity-75 mt-1">Call a function</div>
                    </div>

                    <div
                        draggable
                        onDragStart={(e) => onDragStart(e, 'output')}
                        className="p-3 bg-gradient-to-r from-cyan-100 to-cyan-200 dark:from-cyan-900/30 dark:to-cyan-800/30 text-cyan-800 dark:text-cyan-300 rounded-lg cursor-move hover:shadow-md transition-shadow border-2 border-cyan-300 dark:border-cyan-700"
                    >
                        <div className="font-semibold">▱ Output</div>
                        <div className="text-xs opacity-75 mt-1">Print/display</div>
                    </div>

                    <div
                        draggable
                        onDragStart={(e) => onDragStart(e, 'end')}
                        className="p-3 bg-gradient-to-r from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 text-green-800 dark:text-green-300 rounded-lg cursor-move hover:shadow-md transition-shadow border-2 border-green-300 dark:border-green-700"
                    >
                        <div className="font-semibold">○ End</div>
                        <div className="text-xs opacity-75 mt-1">Program exit</div>
                    </div>
                </div>

                <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
                    <button
                        onClick={handleClear}
                        className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                        Clear All
                    </button>
                    <button
                        onClick={onClose}
                        className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>

            {/* Main Canvas */}
            <div className="flex-1 flex flex-col">
                <div className="h-14 px-6 flex items-center justify-between border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Flowchart Builder</h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Drag nodes • Double-click to edit • Drag from white circle to connect</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => {
                                // DEBUG: Test if code replacement works by directly calling the callback
                                const testCode = '# Debug test\nprint("Hello from debug button!")\n';
                                console.log('DEBUG: Directly calling onGenerateCode with:', testCode);
                                onGenerateCode(testCode as any); // Cast to bypass type check for debug
                            }}
                            className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-bold hover:bg-orange-500 transition-colors"
                        >
                            🐛 Debug Test
                        </button>
                        <button
                            onClick={handleGenerate}
                            disabled={nodes.length === 0}
                            className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg text-sm font-bold hover:from-purple-500 hover:to-purple-600 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl"
                        >
                            🚀 Generate Code
                        </button>
                    </div>
                </div>

                <div className="flex-1 relative bg-gray-100 dark:bg-gray-900">
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        onNodeClick={handleNodeClick}
                        onNodeDoubleClick={handleNodeDoubleClick}
                        onEdgeClick={handleEdgeClick}
                        onDrop={onDrop}
                        onDragOver={onDragOver}
                        nodeTypes={nodeTypes}
                        fitView
                        snapToGrid
                        snapGrid={[15, 15]}
                        deleteKeyCode={["Delete", "Backspace"]}
                        multiSelectionKeyCode="Shift"
                        connectionLineType={ConnectionLineType.SmoothStep}
                        connectionLineStyle={{ 
                            stroke: '#9333ea',
                            strokeWidth: 3,
                            strokeDasharray: '5,5'
                        }}
                        defaultEdgeOptions={{
                            type: 'smoothstep',
                            animated: true,
                            style: { stroke: '#9333ea', strokeWidth: 2 }
                        }}
                        connectOnClick={false}
                        elevateEdgesOnSelect={true}
                    >
                        <Background variant={BackgroundVariant.Dots} gap={15} size={1} className="bg-gray-50 dark:bg-gray-900" />
                        <Controls className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg" />
                        <MiniMap className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg" />
                        <Panel position="top-right" className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                                <div className="font-semibold mb-1">📊 Stats</div>
                                <div>Nodes: {nodes.length}</div>
                                <div>Connections: {edges.length}</div>
                            </div>
                        </Panel>
                        <Panel position="bottom-left" className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                                <div className="font-semibold mb-2">💡 How to Use</div>
                                <div className="space-y-1">
                                    <div>• <strong>Connect:</strong> Drag from white circle</div>
                                    <div>• <strong>Select:</strong> Single click</div>
                                    <div>• <strong>Edit:</strong> Double click</div>
                                    <div>• <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-[10px]">Del/Bksp</kbd> Remove</div>
                                    <div>• <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-[10px]">Shift</kbd> Multi-select</div>
                                </div>
                            </div>
                        </Panel>
                    </ReactFlow>
                </div>
            </div>

            {/* Node Edit Modal */}
            {isEditModalOpen && selectedNode && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setIsEditModalOpen(false)}>
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-96 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">
                            Edit {selectedNode.type?.charAt(0).toUpperCase()}{selectedNode.type?.slice(1)} Node
                        </h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Label</label>
                                <input type="text" value={editFormData.label} onChange={(e) => setEditFormData({ ...editFormData, label: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500" />
                            </div>

                            {selectedNode.type === 'variable' && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Variable Name</label>
                                        <input type="text" value={editFormData.variableName || ''} onChange={(e) => setEditFormData({ ...editFormData, variableName: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500" placeholder="e.g., x" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Value</label>
                                        <input type="text" value={editFormData.variableValue || ''} onChange={(e) => setEditFormData({ ...editFormData, variableValue: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500" placeholder="e.g., 5" />
                                    </div>
                                </>
                            )}

                            {selectedNode.type === 'conditional' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Condition</label>
                                    <input type="text" value={editFormData.condition || ''} onChange={(e) => setEditFormData({ ...editFormData, condition: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500" placeholder="e.g., x > 5" />
                                </div>
                            )}

                            {selectedNode.type === 'loop' && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Loop Type</label>
                                        <select value={editFormData.loopType || 'for'} onChange={(e) => setEditFormData({ ...editFormData, loopType: e.target.value as 'for' | 'while' })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500">
                                            <option value="for">for</option>
                                            <option value="while">while</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Condition</label>
                                        <input type="text" value={editFormData.loopCondition || ''} onChange={(e) => setEditFormData({ ...editFormData, loopCondition: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500" placeholder="e.g., i in range(10)" />
                                    </div>
                                </>
                            )}

                            {selectedNode.type === 'function' && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Function Name</label>
                                        <input type="text" value={editFormData.functionName || ''} onChange={(e) => setEditFormData({ ...editFormData, functionName: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500" placeholder="e.g., calculate" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Arguments</label>
                                        <input type="text" value={editFormData.functionArgs || ''} onChange={(e) => setEditFormData({ ...editFormData, functionArgs: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500" placeholder="e.g., x, y" />
                                    </div>
                                </>
                            )}

                            {selectedNode.type === 'output' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Output Expression</label>
                                    <input type="text" value={editFormData.outputExpression || ''} onChange={(e) => setEditFormData({ ...editFormData, outputExpression: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500" placeholder="e.g., result" />
                                </div>
                            )}
                        </div>

                        <div className="flex gap-2 mt-6">
                            <button onClick={handleDeleteNode} className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg font-medium hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors">
                                Delete Node
                            </button>
                            <button onClick={() => setIsEditModalOpen(false)} className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                                Cancel
                            </button>
                            <button onClick={handleSaveNodeEdit} className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-500 transition-colors shadow-lg">
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edge Edit Modal */}
            {isEdgeEditModalOpen && selectedEdge && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setIsEdgeEditModalOpen(false)}>
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-96" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Edit Connection</h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Label (e.g., "Yes", "No", "True", "False")
                                </label>
                                <input
                                    type="text"
                                    value={edgeLabel}
                                    onChange={(e) => setEdgeLabel(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500"
                                    placeholder="Optional label"
                                />
                            </div>
                        </div>

                        <div className="flex gap-2 mt-6">
                            <button onClick={handleDeleteEdge} className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg font-medium hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors">
                                Delete
                            </button>
                            <button onClick={() => setIsEdgeEditModalOpen(false)} className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                                Cancel
                            </button>
                            <button onClick={handleSaveEdgeEdit} className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-500 transition-colors shadow-lg">
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
