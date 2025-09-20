import React from 'react';
import { Link } from 'react-router-dom';

export const CopyrightFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-background/95 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
            <p className="text-sm text-muted-foreground">
              © {currentYear} TSMO Technology. All rights reserved.
            </p>
            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
              <span>Proprietary & Confidential</span>
              <span>•</span>
              <span>Protected by Copyright Law</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Link 
              to="/terms-and-privacy" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Terms & Privacy
            </Link>
            <Link 
              to="/dmca-center" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              DMCA
            </Link>
            <Link 
              to="/contact" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Legal Contact
            </Link>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t text-center">
          <p className="text-xs text-muted-foreground">
            This software is proprietary to TSMO Technology. Unauthorized reproduction, distribution, or use is strictly prohibited.
            <br />
            For licensing inquiries: <a href="mailto:shirleenacunningham@tsmowatch.com" className="hover:text-foreground transition-colors">shirleenacunningham@tsmowatch.com</a>
          </p>
        </div>
      </div>
    </footer>
  );
};