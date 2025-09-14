'use client';

import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import Link from 'next/link';

interface SimilarityData {
  id: string;
  data: string;
  metadata?: any;
  similarity: number;
  similarityPercentage: number;
  isLinked: boolean;
  isBacklinked: boolean;
  isSimilar: boolean;
  xPosition: number;
}

interface Props {
  entryId: string;
  mainEntry?: {
    id: string;
    data: string;
  };
}

export function SimilarityScatterPlot({ entryId, mainEntry }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [similarities, setSimilarities] = useState<SimilarityData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSimilarities();
  }, [entryId]);

  const fetchSimilarities = async () => {
    if (!entryId) return;

    try {
      setLoading(true);
      setError(null);

      console.log('Fetching similarities for entry:', entryId);

      const response = await fetch('/api/similarities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entryId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Similarities API error:', response.status, errorData);
        throw new Error(`Failed to fetch similarities: ${response.status}`);
      }

      const data = await response.json();
      console.log('Similarities data received:', data.similarities?.length || 0, 'entries');
      setSimilarities(data.similarities || []);
    } catch (error: any) {
      console.error('Failed to fetch similarities:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!similarities.length || loading || error) return;
    drawScatterPlot();
  }, [similarities, loading, error]);

  const drawScatterPlot = () => {
    if (!svgRef.current) return;

    // Clear previous visualization
    d3.select(svgRef.current).selectAll('*').remove();

    const margin = { top: 20, right: 60, bottom: 40, left: 60 };
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.bottom - margin.top;

    const svg = d3.select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Scales
    const xScale = d3.scaleLinear()
      .domain([0, 100])
      .range([0, width]);

    // Y-axis: 100 at bottom (high similarity), 0 at top (low similarity)
    const yScale = d3.scaleLinear()
      .domain([0, 100])
      .range([height, 0]); // Inverted: 0 maps to height (bottom), 100 maps to 0 (top)

    // Add main entry point at center bottom (100% similarity)
    const mainEntryX = width / 2;
    const mainEntryY = yScale(100); // 100% similarity at bottom

    // Add axes
    const xAxis = d3.axisBottom(xScale).tickSize(-height).tickFormat('');
    const yAxis = d3.axisLeft(yScale).ticks(5);

    g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${height})`)
      .call(xAxis)
      .selectAll('line')
      .attr('stroke', '#e5e7eb')
      .attr('stroke-width', 1);

    g.append('g')
      .attr('class', 'y-axis')
      .call(yAxis)
      .selectAll('line')
      .attr('stroke', '#e5e7eb')
      .attr('stroke-width', 1);

    // Y-axis label
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left)
      .attr('x', 0 - (height / 2))
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('fill', '#6b7280')
      .text('Similarity (%)');

    // Add connection lines first (so they appear behind dots)
    similarities.forEach(d => {
      if (d.isLinked || d.isBacklinked) {
        g.append('line')
          .attr('x1', mainEntryX)
          .attr('y1', mainEntryY)
          .attr('x2', xScale(d.xPosition))
          .attr('y2', yScale(d.similarityPercentage))
          .attr('stroke', d.isLinked ? '#3b82f6' : '#ef4444') // Blue for links, red for backlinks
          .attr('stroke-width', 2)
          .attr('opacity', 0.6);
      }
    });

    // Add main entry point
    g.append('circle')
      .attr('cx', mainEntryX)
      .attr('cy', mainEntryY)
      .attr('r', 8)
      .attr('fill', '#10b981') // Green for main entry
      .attr('stroke', '#064e3b')
      .attr('stroke-width', 2);

    // Add main entry label
    g.append('text')
      .attr('x', mainEntryX)
      .attr('y', mainEntryY - 15)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .style('fill', '#064e3b')
      .text('Current Entry');

    // Add similarity points
    const circles = g.selectAll('.similarity-point')
      .data(similarities)
      .enter()
      .append('g')
      .attr('class', 'similarity-point');

    circles.append('circle')
      .attr('cx', d => xScale(d.xPosition))
      .attr('cy', d => yScale(d.similarityPercentage))
      .attr('r', 6)
      .attr('fill', d => {
        if (d.isLinked && d.isBacklinked) return '#8b5cf6'; // Purple for both
        if (d.isLinked) return '#3b82f6'; // Blue for linked
        if (d.isBacklinked) return '#ef4444'; // Red for backlinked
        if (d.isSimilar) return '#f59e0b'; // Orange for similar entries
        return '#6b7280'; // Gray for others
      })
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer');

    // Add tooltips
    circles.append('title')
      .text(d => `${d.data.substring(0, 50)}...\nSimilarity: ${d.similarityPercentage.toFixed(1)}%\nType: ${
        d.isLinked && d.isBacklinked ? 'Linked & Backlinked' :
        d.isLinked ? 'Linked' :
        d.isBacklinked ? 'Backlinked' :
        d.isSimilar ? 'Similar' : 'Related'
      }`);

    // Make circles clickable
    circles.on('click', function(event, d) {
      window.location.href = `/entry/${d.id}`;
    });

    // Add legend
    const legend = g.append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${width - 120}, 20)`);

    const legendData = [
      { color: '#10b981', label: 'Current Entry' },
      { color: '#3b82f6', label: 'Linked' },
      { color: '#ef4444', label: 'Backlinked' },
      { color: '#8b5cf6', label: 'Both' },
      { color: '#f59e0b', label: 'Similar' }
    ];

    const legendItems = legend.selectAll('.legend-item')
      .data(legendData)
      .enter()
      .append('g')
      .attr('class', 'legend-item')
      .attr('transform', (d, i) => `translate(0, ${i * 20})`);

    legendItems.append('circle')
      .attr('cx', 6)
      .attr('cy', 0)
      .attr('r', 4)
      .attr('fill', d => d.color);

    legendItems.append('text')
      .attr('x', 16)
      .attr('y', 0)
      .attr('dy', '0.35em')
      .style('font-size', '11px')
      .style('fill', '#374151')
      .text(d => d.label);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 border border-gray-200 rounded">
        <div className="text-gray-500">Loading similarity visualization...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96 border border-gray-200 rounded">
        <div className="text-red-500">Error loading similarities: {error}</div>
      </div>
    );
  }

  if (similarities.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 border border-gray-200 rounded">
        <div className="text-gray-500">No related entries found</div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded p-4">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Connection Similarity Map</h3>
      <p className="text-sm text-gray-600 mb-4">
        Visualization of how similar this entry is to its linked and backlinked entries.
        Higher positions indicate greater similarity.
      </p>
      <div className="flex justify-center">
        <svg ref={svgRef}></svg>
      </div>
      <div className="mt-4 text-xs text-gray-500">
        Click on any point to navigate to that entry. Lines connect the current entry to directly linked entries.
      </div>
    </div>
  );
}