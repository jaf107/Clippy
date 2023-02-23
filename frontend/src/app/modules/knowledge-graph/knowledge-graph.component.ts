import { Component, EventEmitter, OnInit } from '@angular/core';
import * as cytoscape from 'cytoscape';
import * as panzoom from 'cytoscape';
import * as navigator from 'cytoscape';

@Component({
  selector: 'app-knowledge-graph',
  templateUrl: './knowledge-graph.component.html',
  styleUrls: ['./knowledge-graph.component.css']
})


export class KnowledgeGraphComponent implements OnInit {

  cy: any;

  ngOnInit() {
    // Initialize cytoscape instance
    this.cy = cytoscape({
      container: document.getElementById('cy'),

      // Graph data
      elements: {
        nodes: [
          { data: { id: 'a' , name: 'Automated Repair of Responsive Web Page Layouts' } },
          { data: { id: 'b' , name: 'Automated User Experience Testing through Multi-Dimensional Performance Impact Analysis' } },
          { data: { id: 'c' , name: 'Summarization' } },
          { data: { id: 'd' , name: 'Paperrrr' } },
          { data: { id: 'e' , name: 'SCOREEEE' } },
        ],
        edges: [
          { data: { source: 'a', target: 'b' } },
          { data: { source: 'a', target: 'c' } },
          { data: { source: 'b', target: 'd' } },
          { data: { source: 'd', target: 'e' } },
          { data: { source: 'c', target: 'd' } },
        ],
      },

      // Graph style
      style: [
        {
          selector: 'node',
          style: {
            'shape': 'round-rectangle',
            'text-wrap': 'wrap',
            'text-overflow-wrap': 'whitespace',
            'text-max-width': '140',
            'text-valign': 'center',
            'text-halign': 'center',
            'color': 'black',
            'background-color': 'white',
            'background-fit': 'contain',
            'height': 60,
            'width': 140,
            'padding-top': '10',
            'font-size': '12px',
            'border-color': '#ffffff',
            'border-width': 3,
            'border-opacity': 1,
            'label': 'data(name)', //data(id)
            'text-border-color': '#000000',
            'text-background-shape': 'roundrectangle'
          }
        },
        {
          selector: 'edge',
          style: {
            'width': 3,
            'target-arrow-shape': 'triangle',
            'line-color': 'white',
            'target-arrow-color': 'white',
            'curve-style': 'bezier',
          }
        },
        {
          selector: '#a',
          style: {
            // 'font-size': '15px',
            // 'content': "Abstract on text summarization",
            // 'background-image': '../../assets/images/paper_icon.png'
          }
        },
        
      ],

      // Graph layout
      layout: {
        name: 'breadthfirst',
        fit: true, // whether to fit the viewport to the graph
        directed: true, // whether the tree is directed downwards (or edges can point in any direction if false)
        padding: 30, // padding on fit
        circle: false, // put depths in concentric circles if true, put depths top down if false
        grid: false, // whether to create an even grid into which the DAG is placed (circle:false only)
        spacingFactor: 0.9, // positive spacing factor, larger => more space between nodes (N.B. n/a if causes overlap)
        boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
        avoidOverlap: true, // prevents node overlap, may overflow boundingBox if not enough space
        nodeDimensionsIncludeLabels: false, // Excludes the label when calculating node bounding boxes for the layout algorithm
        roots: undefined, // the roots of the trees
        maximal: false, // whether to shift nodes down their natural BFS depths in order to avoid upwards edges (DAGS only)
        depthSort: undefined, // a sorting function to order nodes at equal depth. e.g. function(a, b){ return a.data('weight') - b.data('weight') }
        animate: false, // whether to transition the node positions
        animationDuration: 500, // duration of animation in ms if enabled
        animationEasing: undefined, // easing of animation if enabled,
        animateFilter: function (node, i) { return true; }, // a function that determines whether the node should be animated.  All nodes animated by default on animate enabled.  Non-animated nodes are positioned immediately when the layout starts
        ready: undefined, // callback on layoutready
        stop: undefined, // callback on layoutstop
      },
    });
    // // Add panzoom and navigator extensions
    panzoom(this.cy);
    navigator(this.cy);
  }
}
