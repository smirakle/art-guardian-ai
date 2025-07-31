import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShoppingCart, Star, ExternalLink, Heart, Share2, GitCompare } from 'lucide-react';
import { GoogleLensObject } from '@/types/visual-recognition';

interface SmartShoppingPanelProps {
  products: GoogleLensObject[];
  onProductSelect: (product: GoogleLensObject) => void;
}

const SmartShoppingPanel = ({ products, onProductSelect }: SmartShoppingPanelProps) => {
  const [favoriteProducts, setFavoriteProducts] = useState<Set<string>>(new Set());
  const [compareList, setCompareList] = useState<Set<string>>(new Set());

  const toggleFavorite = (productId: string) => {
    const newFavorites = new Set(favoriteProducts);
    if (newFavorites.has(productId)) {
      newFavorites.delete(productId);
    } else {
      newFavorites.add(productId);
    }
    setFavoriteProducts(newFavorites);
  };

  const toggleCompare = (productId: string) => {
    const newCompareList = new Set(compareList);
    if (newCompareList.has(productId)) {
      newCompareList.delete(productId);
    } else if (newCompareList.size < 3) {
      newCompareList.add(productId);
    }
    setCompareList(newCompareList);
  };

  const getProductImage = (product: GoogleLensObject) => {
    // In real implementation, this would return actual product images
    return `https://images.unsplash.com/400x300/?${product.label.replace(/\s/g, '-')}`;
  };

  const formatPrice = (priceRange: string) => {
    // Extract and format price information
    const matches = priceRange.match(/\$(\d+)-?(\d+)?/);
    if (matches) {
      const min = matches[1];
      const max = matches[2];
      return max ? `$${min} - $${max}` : `From $${min}`;
    }
    return priceRange;
  };

  if (products.length === 0) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardContent className="p-6 text-center">
          <ShoppingCart className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <h3 className="font-medium mb-2">No Products Detected</h3>
          <p className="text-sm text-muted-foreground">
            Point your camera at products to discover shopping options and price comparisons.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-primary" />
            Smart Shopping ({products.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All Products</TabsTrigger>
              <TabsTrigger value="favorites">Favorites</TabsTrigger>
              <TabsTrigger value="compare">Compare</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-3 mt-4">
              <div className="grid gap-3">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="border border-border/50 rounded-lg p-3 hover:border-primary/50 transition-colors cursor-pointer"
                    onClick={() => onProductSelect(product)}
                  >
                    <div className="flex gap-3">
                      <div className="w-16 h-16 bg-muted rounded-lg flex-shrink-0 overflow-hidden">
                        <img
                          src={getProductImage(product)}
                          alt={product.label}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <h4 className="font-medium text-sm truncate">
                            {product.interactionData?.productInfo?.title || product.label}
                          </h4>
                          <Badge variant="secondary" className="text-xs">
                            {product.confidence}%
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-primary">
                            {formatPrice(product.interactionData?.productInfo?.price || '$0')}
                          </span>
                          {product.interactionData?.productInfo?.rating && (
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              <span className="text-xs">
                                {product.interactionData.productInfo.rating}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 px-2 text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(product.id);
                            }}
                          >
                            <Heart
                              className={`w-3 h-3 ${
                                favoriteProducts.has(product.id) ? 'fill-red-500 text-red-500' : ''
                              }`}
                            />
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 px-2 text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleCompare(product.id);
                            }}
                            disabled={compareList.size >= 3 && !compareList.has(product.id)}
                          >
                            <GitCompare className="w-3 h-3" />
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 px-2 text-xs"
                          >
                            <Share2 className="w-3 h-3" />
                          </Button>
                          
                          <Button
                            size="sm"
                            className="h-7 px-2 text-xs bg-gradient-to-r from-primary to-accent"
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            Shop
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="favorites" className="space-y-3 mt-4">
              {Array.from(favoriteProducts).length === 0 ? (
                <div className="text-center py-6">
                  <Heart className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">No favorite products yet</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {products
                    .filter(product => favoriteProducts.has(product.id))
                    .map((product) => (
                      <div
                        key={product.id}
                        className="border border-border/50 rounded-lg p-3 bg-red-50/50 dark:bg-red-950/20"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">{product.label}</span>
                          <span className="text-primary font-semibold">
                            {formatPrice(product.interactionData?.productInfo?.price || '$0')}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="compare" className="space-y-3 mt-4">
              {compareList.size === 0 ? (
                <div className="text-center py-6">
                  <GitCompare className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Add products to compare prices and features
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {products
                    .filter(product => compareList.has(product.id))
                    .map((product) => (
                      <div
                        key={product.id}
                        className="border border-border/50 rounded-lg p-3 bg-blue-50/50 dark:bg-blue-950/20"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">{product.label}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-primary font-semibold">
                              {formatPrice(product.interactionData?.productInfo?.price || '$0')}
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0"
                              onClick={() => toggleCompare(product.id)}
                            >
                              ×
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  
                  {compareList.size > 1 && (
                    <Button className="w-full mt-3">
                      Compare {compareList.size} Products
                    </Button>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default SmartShoppingPanel;