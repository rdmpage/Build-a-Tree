/*
 * Build-a-Tree
 * Life on Earth Project (http://sdr.seas.harvard.edu/content/life-earth)
 *
 * Michael S. Horn
 * Northwestern University
 * michael-horn@northwestern.edu
 * Copyright 2011, Michael S. Horn
 *
 * This project was funded by the National Science Foundation (grant 1010889).
 * Any opinions, findings and conclusions or recommendations expressed in this
 * material are those of the author(s) and do not necessarily reflect the views
 * of the National Science Foundation (NSF).
 */

//===================================================================
// Tip of a cladogram ( extends Node)
//===================================================================
function Tip(id) {
   
   // call superclass constructor
   this.scnstrctr = Node; 
   this.scnstrctr(id);
   
   this.image       = document.createElement("img");
   this.color       = null;
   this.force       = { fx : 0, fy : 0, stress : 0 };
   this.velocity    = { vx : 0, vy : 0 };
   this.docked      = true;
   this.hint        = "";
   this.depth       = 0;
   
   this.clone = function() {
      var copy = new Tip(this.getID());
      this.copyNode(copy);
      copy.image     = this.image;
      copy.color     = this.color;
      copy.force     = { fx : this.force.fx, fy : this.force.fy, stress : this.force.stress };
      copy.velocity  = { vx : this.velocity.vx, vy : this.velocity.vy };
      copy.docked    = this.docked;
      copy.hint      = this.hint;
      return copy;
   }
   
   this.isTip = function() {
      return true;
   }
   
   this.setImageSrc = function(src) {
      this.image.src = "images/" + src + ".png";
   }
   
   this.getImage = function() {
      return this.image;
   }
   
   this.setColor = function(color) {
      this.color = color;
   }
   
   this.getColor = function() {
      return this.color;
   }
   
   this.isDocked = function() {
      return this.docked;
   }
   
   this.setDocked = function(docked) {
      this.docked = docked;
   }
   
   this.setHintText = function(text) {
      this.hint = text;
   }
   
   this.getHintText = function() {
      return this.hint;
   }
   
   this.overlaps = function(taxon) {
      var a = this;
      var b = taxon;
      if (a != b &&
          (a.isTip() || b.isTip()) &&
          !a.isDocked() && !b.isDocked() &&
          a.getRoot() != b.getRoot()) {
         var dx = Math.abs(a.cx - b.cx);
         var dy = Math.abs(a.cy - b.cy);
         var r = a.w;
         if (b.hasParent()) r *= 0.9;
         return ((dx * dx + dy * dy) < (r * r));
      }
      return false;
   }
   
   this.getTreeString = function() { return this.getName(); }
   
   
//----------------------------------------------------------------------
// Draws the name of the tip
//----------------------------------------------------------------------
   this.drawHighlight = function(g) {
      g.fillStyle = Theme.FOREGROUND;
      g.textAlign = "center";
      g.textBaseline = "bottom";
      g.font = "14pt Tahoma, Arial, sans-serif";
      g.beginPath();
      g.fillText(this.name, this.cx, this.cy - this.w/2 - 5);
   }
   
   this.draw = function(g) {
      
      var pinned = this.getRoot().isPinned();
      
      // Token highlight
      if (this.hasToken() && !this.hasParent()) {
         g.beginPath();
         g.fillStyle = "rgba(255, 255, 255, 0.1)";
         g.arc(this.cx, this.cy, this.w/2 + 4, 0, Math.PI * 2, true);
         g.fill();
         this.drawHighlight(g);
      }
      else if (this.isHighlighted()) {
         this.drawHighlight(g);
      }
      
      // Draw colored circle if not connected to the tree
      if (!this.hasParent() && !this.hasToken()) {
         g.fillStyle = this.color;
         g.beginPath();
         g.arc(this.cx, this.cy, this.w/2 - 1.5, 0, Math.PI*2, true);
         g.fill();
      }
      
      // Draw connecting line to parent
      else if (this.hasParent()) {
         var wl = this.getWaterline();
         var lt = 8;  // default line thickness
         if (this.hasToken() || pinned) {
            lt = Math.max(8 - ((Math.abs(wl - this.getCenterY()) / 100) * 8), 1);
         }
         g.lineWidth = lt;
         g.strokeStyle = this.getParent().isCorrect()?
            Theme.FOREGROUND : Theme.FADED; 
         g.lineCap = "round";
         g.beginPath();
         g.moveTo(this.getCenterX(), this.getCenterY() + 2);
         g.lineTo(this.getCenterX(), this.getParent().getCenterY());
         g.stroke();
      }
      
      if (!this.hasToken()) {
         g.fillStyle = Theme.FOREGROUND;
         g.beginPath();
         g.arc(this.cx, this.cy, this.w/2 - 12, 0, Math.PI * 2, true);
         g.fill();
         g.drawImage(this.image, this.cx - this.w/2, this.cy - this.w/2);
      }
   }

   this.animate = function() {
      var pinned = this.getRoot().isPinned();
      
      this.velocity.vx += this.force.fx;
      this.velocity.vy += this.force.fy;
      this.velocity.vx *= 0.6;
      this.velocity.vy *= 0.6;
      
      if (!pinned && !this.isDragging() && !this.hasToken()) {
         this.cx += this.velocity.vx;
         this.cy += this.velocity.vy;
      }

      else if ((pinned || this.hasToken()) && this.hasParent()) {
         var p = this.getParent();
         var ty = this.getWaterline();
         if (Math.abs(this.cy - ty) > 100) {
            tree.breakTree(this);
         }
      }
   }
   
   
//----------------------------------------------------------------------
// Recursively determine the highlight 
//----------------------------------------------------------------------
   this.determineHighlight = function(free) {
      this.setHighlight(free && this.isDragging());
      return this.isHighlighted();
   }
}
