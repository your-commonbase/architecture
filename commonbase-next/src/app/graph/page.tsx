'use client';

import { useState, useEffect, useRef } from 'react';
import { UMAP } from 'umap-js';
import * as d3 from 'd3';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Entry {
  id: string;
  data: string;
  metadata?: any;
  created: string;
  updated: string;
}

interface GraphNode {
  id: string;
  name: string;
  type: string;
  data: string;
  metadata?: Record<string, unknown>;
  color?: string;
  size?: number;
  x?: number;
  y?: number;
  fx?: number;
  fy?: number;
}

interface GraphLink {
  source: string;
  target: string;
  type: 'link' | 'backlink';
}

interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export default function GraphPage() {
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
  const [loading, setLoading] = useState(false);
  const [loadedIds, setLoadedIds] = useState<Set<string>>(new Set());
  const [hasMore, setHasMore] = useState(true);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const getNodeColor = (type: string, metadata?: Record<string, unknown>) => {
    if (type === 'image') return '#e74c3c';
    if (metadata?.isComment || metadata?.type === 'comment') return '#f39c12';
    if (metadata?.type === 'synthesis') return '#9b59b6';
    return '#3498db';
  };

  const getNodeSize = (data: string) => {
    // Size based on content length
    const baseSize = 4;
    const lengthFactor = Math.log(data.length + 1) * 0.5;
    return Math.min(baseSize + lengthFactor, 12);
  };

  const [currentPage, setCurrentPage] = useState(1);
  const [allEmbeddings, setAllEmbeddings] = useState<Map<string, number[]>>(new Map());

  const applyUMAPPositioning = (nodes: GraphNode[], embeddings: Map<string, number[]>) => {
    console.log('UMAP positioning called with', nodes.length, 'nodes and', embeddings.size, 'embeddings');
    
    if (embeddings.size < 2) {
      console.log('Not enough embeddings, using random positions');
      // Fallback to random positions if not enough embeddings
      const width = 800;
      const height = 600;
      const margin = 50;
      
      return nodes.map((node, index) => ({
        ...node,
        x: margin + Math.random() * (width - 2 * margin),
        y: margin + Math.random() * (height - 2 * margin),
      }));
    }

    const nodeIds = nodes.map(n => n.id);
    const embeddingMatrix = nodeIds
      .map(id => embeddings.get(id))
      .filter(embedding => embedding !== undefined) as number[][];

    console.log('Embedding matrix size:', embeddingMatrix.length, 'x', embeddingMatrix[0]?.length);

    if (embeddingMatrix.length < 2) {
      console.log('Not enough valid embeddings, using random positions');
      // Fallback to random positions
      const width = 800;
      const height = 600;
      const margin = 50;
      
      return nodes.map((node, index) => ({
        ...node,
        x: margin + Math.random() * (width - 2 * margin),
        y: margin + Math.random() * (height - 2 * margin),
      }));
    }

    // 2D UMAP parameters optimized for better spread
    const umap = new UMAP({
      nComponents: 2,
      nNeighbors: Math.min(10, Math.max(2, Math.floor(embeddingMatrix.length * 0.15))),
      minDist: 0.3, // Increased for more spread
      spread: 2.0,  // Increased for more spread
      nEpochs: 300, // More epochs for better convergence
      learningRate: 1.5,
    });

    console.log('Starting UMAP fit...');
    const positions = umap.fit(embeddingMatrix);
    console.log('UMAP positions:', positions.length, positions.slice(0, 3));

    // Find the actual range of positions
    const xValues = positions.map(p => p[0]);
    const yValues = positions.map(p => p[1]);
    const minX = Math.min(...xValues);
    const maxX = Math.max(...xValues);
    const minY = Math.min(...yValues);
    const maxY = Math.max(...yValues);
    
    console.log('Position ranges:', { minX, maxX, minY, maxY });

    // Scale to container dimensions
    const width = 800;
    const height = 600;
    const margin = 50;
    
    return nodes.map((node, index) => {
      if (index < positions.length) {
        const [x, y] = positions[index];
        
        // Normalize to 0-1 range first, handle edge cases
        const rangeX = maxX - minX;
        const rangeY = maxY - minY;
        const normalizedX = rangeX > 0 ? (x - minX) / rangeX : 0.5;
        const normalizedY = rangeY > 0 ? (y - minY) / rangeY : 0.5;
        
        // Scale to container
        const scaledX = margin + normalizedX * (width - 2 * margin);
        const scaledY = margin + normalizedY * (height - 2 * margin);
        
        console.log(`Node ${index}: (${x}, ${y}) -> (${normalizedX}, ${normalizedY}) -> (${scaledX}, ${scaledY})`);
        
        return {
          ...node,
          x: scaledX,
          y: scaledY,
        };
      }
      return {
        ...node,
        x: width / 2,
        y: height / 2,
      };
    });
  };

  const fetchEmbeddingsForNodes = async (nodeIds: string[]) => {
    try {
      const response = await fetch('/api/embeddings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: nodeIds }),
      });

      if (response.ok) {
        const results = await response.json();
        const newEmbeddings = new Map(allEmbeddings);
        
        results.forEach((result: Record<string, unknown>) => {
          if (result.embedding && Array.isArray(result.embedding)) {
            newEmbeddings.set(result.id as string, result.embedding as number[]);
          }
        });
        
        setAllEmbeddings(newEmbeddings);
        return newEmbeddings;
      }
    } catch (error) {
      console.error('Failed to fetch embeddings:', error);
    }
    return allEmbeddings;
  };

  const fetchGraphData = async (page = 1, limit = 10) => {
    if (loading) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/list?page=${page}&limit=${limit}`);
      
      if (response.ok) {
        const result = await response.json();
        const entries: Entry[] = result.entries;
        
        if (entries.length === 0) {
          setHasMore(false);
          return;
        }
        
        // Create nodes from new entries
        const newNodes: GraphNode[] = entries.map(entry => ({
          id: entry.id,
          name: entry.data.substring(0, 50) + (entry.data.length > 50 ? '...' : ''),
          type: entry.metadata?.type || 'text',
          data: entry.data,
          metadata: entry.metadata,
          color: getNodeColor(entry.metadata?.type || 'text', entry.metadata),
          size: getNodeSize(entry.data)
        }));

        // Fetch embeddings for new nodes and apply UMAP positioning
        const newNodeIds = entries.map(e => e.id);
        const updatedEmbeddings = await fetchEmbeddingsForNodes(newNodeIds);
        
        // Apply UMAP positioning to all nodes (existing + new)
        const allNodes = [...graphData.nodes, ...newNodes];
        const positionedNodes = applyUMAPPositioning(allNodes, updatedEmbeddings);
        
        // Split back into existing and new nodes
        const existingNodeCount = graphData.nodes.length;
        const positionedExistingNodes = positionedNodes.slice(0, existingNodeCount);
        const positionedNewNodes = positionedNodes.slice(existingNodeCount);
        
        // Create links from metadata
        const newLinks: GraphLink[] = [];
        const allExistingIds = new Set([...loadedIds, ...entries.map(e => e.id)]);
        
        entries.forEach(entry => {
          const metadata = entry.metadata as Record<string, unknown>;
          
          // Add links (outgoing)
          if (metadata?.links && Array.isArray(metadata.links)) {
            metadata.links.forEach((linkId: string) => {
              if (allExistingIds.has(linkId)) {
                newLinks.push({
                  source: entry.id,
                  target: linkId,
                  type: 'link'
                });
              }
            });
          }
          
          // Add backlinks (incoming)
          if (metadata?.backlinks && Array.isArray(metadata.backlinks)) {
            metadata.backlinks.forEach((backlinkId: string) => {
              if (allExistingIds.has(backlinkId)) {
                newLinks.push({
                  source: backlinkId,
                  target: entry.id,
                  type: 'backlink'
                });
              }
            });
          }
        });
        
        setGraphData(prev => ({
          nodes: [...positionedExistingNodes, ...positionedNewNodes],
          links: [...prev.links, ...newLinks]
        }));
        
        setLoadedIds(prev => new Set([...prev, ...entries.map(e => e.id)]));
        
        // Use the hasMore field from the API response
        setHasMore(result.hasMore);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error('Failed to fetch graph data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    
    const loadInitialData = async () => {
      if (mounted) {
        await fetchGraphData(1, 10);
      }
    };
    
    loadInitialData();
    
    return () => {
      mounted = false;
    };
  }, []);

  // D3 visualization effect
  useEffect(() => {
    if (!svgRef.current || !containerRef.current || graphData.nodes.length === 0) return;

    const svg = d3.select(svgRef.current);
    const container = d3.select(containerRef.current);
    
    const width = 800;
    const height = 600;
    
    // Clear previous content
    svg.selectAll("*").remove();
    
    // Create zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        svg.select('.zoom-group').attr('transform', event.transform);
      });
    
    svg.call(zoom);
    
    // Create main group for zooming
    const g = svg.append('g').attr('class', 'zoom-group');
    
    // Draw links
    const links = g.selectAll('.link')
      .data(graphData.links)
      .enter()
      .append('line')
      .attr('class', 'link')
      .style('stroke', '#95a5a6')
      .style('stroke-width', 1)
      .style('opacity', 0.6);
    
    // Add labels (hidden by default, shown on hover)
    const labels = g.selectAll('.label')
      .data(graphData.nodes)
      .enter()
      .append('text')
      .attr('class', 'label')
      .text(d => d.name)
      .style('font-size', '10px')
      .style('fill', '#333')
      .style('text-anchor', 'middle')
      .style('pointer-events', 'none')
      .style('opacity', 0);
    
    // Draw nodes
    const nodes = g.selectAll('.node')
      .data(graphData.nodes)
      .enter()
      .append('circle')
      .attr('class', 'node')
      .attr('r', d => d.size || 4)
      .style('fill', d => d.color || '#3498db')
      .style('stroke', '#fff')
      .style('stroke-width', 1.5)
      .style('cursor', 'pointer')
      .on('click', (event, d) => setSelectedNode(d))
      .on('mouseover', function(event, d) {
        d3.select(this).style('stroke-width', 3);
        // Show corresponding label
        labels.filter(label => label.id === d.id).style('opacity', 1);
      })
      .on('mouseout', function(event, d) {
        d3.select(this).style('stroke-width', 1.5);
        // Hide corresponding label
        labels.filter(label => label.id === d.id).style('opacity', 0);
      });
    
    // Update positions
    const updatePositions = () => {
      links
        .attr('x1', d => {
          const source = graphData.nodes.find(n => n.id === d.source);
          return source?.x || 0;
        })
        .attr('y1', d => {
          const source = graphData.nodes.find(n => n.id === d.source);
          return source?.y || 0;
        })
        .attr('x2', d => {
          const target = graphData.nodes.find(n => n.id === d.target);
          return target?.x || 0;
        })
        .attr('y2', d => {
          const target = graphData.nodes.find(n => n.id === d.target);
          return target?.y || 0;
        });
      
      nodes
        .attr('cx', d => d.x || 0)
        .attr('cy', d => d.y || 0);
      
      labels
        .attr('x', d => d.x || 0)
        .attr('y', d => (d.y || 0) - (d.size || 4) - 5);
    };
    
    updatePositions();
    
  }, [graphData]);

  const loadMoreData = () => {
    if (hasMore && !loading) {
      fetchGraphData(currentPage + 1, 10);
    }
  };

  const resetView = () => {
    if (svgRef.current) {
      const svg = d3.select(svgRef.current);
      svg.transition().duration(750).call(
        d3.zoom<SVGSVGElement, unknown>().transform,
        d3.zoomIdentity
      );
    }
  };

  const focusNode = (nodeId: string) => {
    const node = graphData.nodes.find(n => n.id === nodeId);
    if (node && svgRef.current && node.x !== undefined && node.y !== undefined) {
      const svg = d3.select(svgRef.current);
      const width = 800;
      const height = 600;
      
      svg.transition().duration(750).call(
        d3.zoom<SVGSVGElement, unknown>().transform,
        d3.zoomIdentity
          .translate(width / 2, height / 2)
          .scale(2)
          .translate(-node.x, -node.y)
      );
    }
  };

  return (
    <div className="container mx-auto py-4 sm:py-8 px-4">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-4 lg:space-y-0 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Knowledge Graph</h1>
          <p className="text-sm sm:text-base text-gray-600">
            Explore your entries in 2D space. Nodes represent entries positioned by semantic similarity, edges show connections.
          </p>
          <div className="text-xs text-gray-500">
            {graphData.nodes.length} nodes loaded, {graphData.links.length} links
          </div>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <Button onClick={resetView} variant="outline" size="sm" className="w-full sm:w-auto">
            Reset View
          </Button>
          <Button 
            onClick={loadMoreData} 
            disabled={loading || !hasMore}
            size="sm"
            className="w-full sm:w-auto"
          >
            {loading ? 'Loading...' : hasMore ? 'Load More' : 'All Loaded'}
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:grid lg:grid-cols-4 gap-4 lg:gap-6">
        {/* Side Panel - Mobile First */}
        <div className="lg:col-span-1 space-y-4 order-1 lg:order-2">
          {/* Show condensed stats on mobile */}
          <div className="lg:hidden">
            <Card>
              <CardContent className="p-3">
                <div className="flex justify-between items-center text-xs">
                  <span>Nodes: {graphData.nodes.length}</span>
                  <span>Links: {graphData.links.length}</span>
                  <span>More: {hasMore ? "Yes" : "No"}</span>
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Legend - Hidden on mobile, shown on desktop */}
          <div className="hidden lg:block">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Legend</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-xs">Text Entry</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-xs">Image Entry</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                  <span className="text-xs">Comment</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                  <span className="text-xs">Synthesis</span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="text-xs text-gray-500">
                    Node size = content length
                  </div>
                  <div className="text-xs text-gray-500">
                    Lines = connections
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats - Hidden on mobile, shown on desktop */}
          <div className="hidden lg:block">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Graph Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Nodes:</span>
                  <Badge variant="secondary">{graphData.nodes.length}</Badge>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Connections:</span>
                  <Badge variant="secondary">{graphData.links.length}</Badge>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Has More:</span>
                  <Badge variant={hasMore ? "default" : "secondary"}>
                    {hasMore ? "Yes" : "No"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Selected Node Details */}
          {selectedNode && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Selected Node</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <Badge variant="outline" className="mb-2">
                    {selectedNode.type}
                  </Badge>
                </div>
                <div className="text-xs break-words">
                  <strong>Content:</strong>
                  <p className="mt-1 text-gray-600">
                    {selectedNode.data.substring(0, 150)}
                    {selectedNode.data.length > 150 ? '...' : ''}
                  </p>
                </div>
                <div className="pt-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full text-xs"
                    onClick={() => focusNode(selectedNode.id)}
                  >
                    Focus Node
                  </Button>
                </div>
                <div className="pt-1">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full text-xs"
                    onClick={() => window.open(`/entry/${selectedNode.id}`, '_blank')}
                  >
                    View Entry
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          </div>
        </div>
        
        {/* Graph Visualization */}
        <div className="lg:col-span-3 order-2 lg:order-1">
          <Card>
            <CardContent className="p-0">
              <div 
                ref={containerRef}
                className="relative overflow-hidden rounded-lg bg-white h-96 sm:h-[500px] lg:h-[600px]"
              >
                <svg
                  ref={svgRef}
                  width="100%"
                  height="100%"
                  style={{ background: '#f8f9fa' }}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}