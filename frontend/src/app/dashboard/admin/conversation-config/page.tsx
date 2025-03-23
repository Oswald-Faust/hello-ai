"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertCircle, Check, File, Plus, Trash2, Upload } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";

// Types pour la configuration de conversation
interface Variable {
  name: string;
  description: string;
  defaultValue: string;
  required: boolean;
}

interface PdfDocument {
  _id: string;
  name: string;
  path: string;
  uploadDate: string;
}

interface ConversationConfig {
  _id: string;
  name: string;
  description: string;
  conversationType: string;
  contextParameters: Record<string, any>;
  variables: Variable[];
  pdfDocuments: PdfDocument[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function ConversationConfigPage() {
  const router = useRouter();
  const [configs, setConfigs] = useState<ConversationConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("list");
  const [selectedConfig, setSelectedConfig] = useState<ConversationConfig | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    conversationType: "custom",
    contextParameters: {},
    variables: [],
    active: true
  });
  const [newVariable, setNewVariable] = useState({
    name: "",
    description: "",
    defaultValue: "",
    required: false
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Charger les configurations au chargement de la page
  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/conversation-configs');
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des configurations');
      }
      
      const data = await response.json();
      setConfigs(data);
      setError(null);
    } catch (err) {
      setError('Impossible de charger les configurations');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateConfig = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/conversation-configs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la création de la configuration');
      }
      
      const newConfig = await response.json();
      setConfigs([...configs, newConfig]);
      setActiveTab("list");
      resetForm();
      toast({
        title: "Configuration créée",
        description: "La configuration a été créée avec succès.",
        variant: "default",
      });
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Impossible de créer la configuration.",
        variant: "destructive",
      });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateConfig = async () => {
    if (!selectedConfig) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/conversation-configs/${selectedConfig._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour de la configuration');
      }
      
      const updatedConfig = await response.json();
      setConfigs(configs.map(config => 
        config._id === updatedConfig._id ? updatedConfig : config
      ));
      setActiveTab("list");
      resetForm();
      toast({
        title: "Configuration mise à jour",
        description: "La configuration a été mise à jour avec succès.",
        variant: "default",
      });
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la configuration.",
        variant: "destructive",
      });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfig = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/conversation-configs/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la suppression de la configuration');
      }
      
      setConfigs(configs.filter(config => config._id !== id));
      toast({
        title: "Configuration supprimée",
        description: "La configuration a été supprimée avec succès.",
        variant: "default",
      });
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la configuration.",
        variant: "destructive",
      });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadPdf = async (configId: string) => {
    if (!selectedFile) return;
    
    const formData = new FormData();
    formData.append('pdf', selectedFile);
    
    try {
      setUploadProgress(10);
      const response = await fetch(`/api/conversation-configs/${configId}/pdf`, {
        method: 'POST',
        body: formData
      });
      
      setUploadProgress(90);
      
      if (!response.ok) {
        throw new Error('Erreur lors de l\'upload du PDF');
      }
      
      const updatedConfig = await response.json();
      setConfigs(configs.map(config => 
        config._id === updatedConfig._id ? updatedConfig : config
      ));
      
      setSelectedFile(null);
      setUploadProgress(100);
      
      setTimeout(() => {
        setUploadProgress(0);
      }, 1000);
      
      toast({
        title: "PDF uploadé",
        description: "Le document PDF a été uploadé avec succès.",
        variant: "default",
      });
    } catch (err) {
      setUploadProgress(0);
      toast({
        title: "Erreur",
        description: "Impossible d'uploader le document PDF.",
        variant: "destructive",
      });
      console.error(err);
    }
  };

  const handleDeletePdf = async (configId: string, pdfId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/conversation-configs/${configId}/pdf/${pdfId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la suppression du PDF');
      }
      
      const updatedConfig = await response.json();
      setConfigs(configs.map(config => 
        config._id === updatedConfig._id ? updatedConfig : config
      ));
      
      toast({
        title: "PDF supprimé",
        description: "Le document PDF a été supprimé avec succès.",
        variant: "default",
      });
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le document PDF.",
        variant: "destructive",
      });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const editConfig = (config: ConversationConfig) => {
    setSelectedConfig(config);
    setFormData({
      name: config.name,
      description: config.description,
      conversationType: config.conversationType,
      contextParameters: config.contextParameters,
      variables: config.variables,
      active: config.active
    });
    setActiveTab("edit");
  };

  const addNewVariable = () => {
    if (!newVariable.name) return;
    
    setFormData({
      ...formData,
      variables: [...formData.variables, newVariable]
    });
    
    setNewVariable({
      name: "",
      description: "",
      defaultValue: "",
      required: false
    });
  };

  const removeVariable = (index: number) => {
    const updatedVariables = [...formData.variables];
    updatedVariables.splice(index, 1);
    
    setFormData({
      ...formData,
      variables: updatedVariables
    });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      conversationType: "custom",
      contextParameters: {},
      variables: [],
      active: true
    });
    setSelectedConfig(null);
  };

  if (error) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Erreur</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Configuration des Conversations</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="list">Liste des configurations</TabsTrigger>
          <TabsTrigger value="create">Créer une configuration</TabsTrigger>
          {selectedConfig && <TabsTrigger value="edit">Modifier la configuration</TabsTrigger>}
        </TabsList>
        
        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>Configurations de conversation</CardTitle>
              <CardDescription>
                Gérez vos configurations de conversation pour vos modèles IA.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4">Chargement...</div>
              ) : configs.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  Aucune configuration trouvée. Créez votre première configuration.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Variables</TableHead>
                      <TableHead>Documents</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {configs.map((config) => (
                      <TableRow key={config._id}>
                        <TableCell className="font-medium">{config.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {config.conversationType.charAt(0).toUpperCase() + config.conversationType.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>{config.variables.length}</TableCell>
                        <TableCell>{config.pdfDocuments.length}</TableCell>
                        <TableCell>
                          <Badge variant={config.active ? "success" : "secondary"}>
                            {config.active ? "Actif" : "Inactif"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button variant="outline" size="sm" onClick={() => editConfig(config)}>
                              Modifier
                            </Button>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="destructive" size="sm">
                                  Supprimer
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Confirmer la suppression</DialogTitle>
                                  <DialogDescription>
                                    Êtes-vous sûr de vouloir supprimer cette configuration ? Cette action est irréversible.
                                  </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                  <Button variant="outline" onClick={() => handleDeleteConfig(config._id)}>
                                    Confirmer
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
            <CardFooter>
              <Button onClick={() => { setActiveTab("create"); resetForm(); }}>
                <Plus className="mr-2 h-4 w-4" /> Créer une configuration
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle>Nouvelle configuration</CardTitle>
              <CardDescription>
                Créez une nouvelle configuration pour personnaliser les conversations IA.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom de la configuration</Label>
                    <Input 
                      id="name" 
                      placeholder="Nom de la configuration"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="type">Type de conversation</Label>
                    <Select 
                      value={formData.conversationType}
                      onValueChange={(value) => setFormData({...formData, conversationType: value})}
                    >
                      <SelectTrigger id="type">
                        <SelectValue placeholder="Sélectionner un type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sales">Ventes</SelectItem>
                        <SelectItem value="support">Support</SelectItem>
                        <SelectItem value="information">Information</SelectItem>
                        <SelectItem value="custom">Personnalisé</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Description de la configuration"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Variables personnalisées</Label>
                  <div className="border rounded-md p-4">
                    <div className="space-y-4">
                      {formData.variables.length > 0 ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Nom</TableHead>
                              <TableHead>Description</TableHead>
                              <TableHead>Valeur par défaut</TableHead>
                              <TableHead>Requis</TableHead>
                              <TableHead></TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {formData.variables.map((variable, index) => (
                              <TableRow key={index}>
                                <TableCell>{variable.name}</TableCell>
                                <TableCell>{variable.description}</TableCell>
                                <TableCell>{variable.defaultValue}</TableCell>
                                <TableCell>{variable.required ? "Oui" : "Non"}</TableCell>
                                <TableCell>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => removeVariable(index)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      ) : (
                        <div className="text-center py-2 text-muted-foreground">
                          Aucune variable définie
                        </div>
                      )}
                      
                      <div className="grid grid-cols-5 gap-2">
                        <div>
                          <Input 
                            placeholder="Nom de la variable"
                            value={newVariable.name}
                            onChange={(e) => setNewVariable({...newVariable, name: e.target.value})}
                          />
                        </div>
                        <div>
                          <Input 
                            placeholder="Description"
                            value={newVariable.description}
                            onChange={(e) => setNewVariable({...newVariable, description: e.target.value})}
                          />
                        </div>
                        <div>
                          <Input 
                            placeholder="Valeur par défaut"
                            value={newVariable.defaultValue}
                            onChange={(e) => setNewVariable({...newVariable, defaultValue: e.target.value})}
                          />
                        </div>
                        <div className="flex items-center">
                          <Label className="flex items-center space-x-2 cursor-pointer">
                            <input 
                              type="checkbox"
                              checked={newVariable.required}
                              onChange={(e) => setNewVariable({...newVariable, required: e.target.checked})}
                              className="checkbox"
                            />
                            <span>Requis</span>
                          </Label>
                        </div>
                        <div>
                          <Button onClick={addNewVariable} disabled={!newVariable.name}>
                            Ajouter
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => { setActiveTab("list"); resetForm(); }}>
                Annuler
              </Button>
              <Button onClick={handleCreateConfig} disabled={!formData.name}>
                Créer la configuration
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="edit">
          {selectedConfig && (
            <Card>
              <CardHeader>
                <CardTitle>Modifier la configuration</CardTitle>
                <CardDescription>
                  Modifiez les détails de votre configuration.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-name">Nom de la configuration</Label>
                      <Input 
                        id="edit-name" 
                        placeholder="Nom de la configuration"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="edit-type">Type de conversation</Label>
                      <Select 
                        value={formData.conversationType}
                        onValueChange={(value) => setFormData({...formData, conversationType: value})}
                      >
                        <SelectTrigger id="edit-type">
                          <SelectValue placeholder="Sélectionner un type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sales">Ventes</SelectItem>
                          <SelectItem value="support">Support</SelectItem>
                          <SelectItem value="information">Information</SelectItem>
                          <SelectItem value="custom">Personnalisé</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="edit-description">Description</Label>
                    <Textarea 
                      id="edit-description" 
                      placeholder="Description de la configuration"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Variables personnalisées</Label>
                    <div className="border rounded-md p-4">
                      <div className="space-y-4">
                        {formData.variables.length > 0 ? (
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Nom</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Valeur par défaut</TableHead>
                                <TableHead>Requis</TableHead>
                                <TableHead></TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {formData.variables.map((variable, index) => (
                                <TableRow key={index}>
                                  <TableCell>{variable.name}</TableCell>
                                  <TableCell>{variable.description}</TableCell>
                                  <TableCell>{variable.defaultValue}</TableCell>
                                  <TableCell>{variable.required ? "Oui" : "Non"}</TableCell>
                                  <TableCell>
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => removeVariable(index)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        ) : (
                          <div className="text-center py-2 text-muted-foreground">
                            Aucune variable définie
                          </div>
                        )}
                        
                        <div className="grid grid-cols-5 gap-2">
                          <div>
                            <Input 
                              placeholder="Nom de la variable"
                              value={newVariable.name}
                              onChange={(e) => setNewVariable({...newVariable, name: e.target.value})}
                            />
                          </div>
                          <div>
                            <Input 
                              placeholder="Description"
                              value={newVariable.description}
                              onChange={(e) => setNewVariable({...newVariable, description: e.target.value})}
                            />
                          </div>
                          <div>
                            <Input 
                              placeholder="Valeur par défaut"
                              value={newVariable.defaultValue}
                              onChange={(e) => setNewVariable({...newVariable, defaultValue: e.target.value})}
                            />
                          </div>
                          <div className="flex items-center">
                            <Label className="flex items-center space-x-2 cursor-pointer">
                              <input 
                                type="checkbox"
                                checked={newVariable.required}
                                onChange={(e) => setNewVariable({...newVariable, required: e.target.checked})}
                                className="checkbox"
                              />
                              <span>Requis</span>
                            </Label>
                          </div>
                          <div>
                            <Button onClick={addNewVariable} disabled={!newVariable.name}>
                              Ajouter
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Documents PDF</Label>
                    <div className="border rounded-md p-4">
                      <div className="space-y-4">
                        {selectedConfig.pdfDocuments.length > 0 ? (
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Nom</TableHead>
                                <TableHead>Date d'upload</TableHead>
                                <TableHead></TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {selectedConfig.pdfDocuments.map((doc) => (
                                <TableRow key={doc._id}>
                                  <TableCell className="flex items-center">
                                    <File className="h-4 w-4 mr-2" />
                                    {doc.name}
                                  </TableCell>
                                  <TableCell>
                                    {new Date(doc.uploadDate).toLocaleDateString()}
                                  </TableCell>
                                  <TableCell>
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => handleDeletePdf(selectedConfig._id, doc._id)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        ) : (
                          <div className="text-center py-2 text-muted-foreground">
                            Aucun document PDF
                          </div>
                        )}
                        
                        <div className="grid grid-cols-3 gap-2">
                          <div className="col-span-2">
                            <Input 
                              type="file" 
                              accept=".pdf"
                              onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)}
                            />
                            {uploadProgress > 0 && (
                              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                                <div 
                                  className="bg-blue-600 h-2.5 rounded-full" 
                                  style={{ width: `${uploadProgress}%` }}
                                ></div>
                              </div>
                            )}
                          </div>
                          <div>
                            <Button 
                              onClick={() => handleUploadPdf(selectedConfig._id)}
                              disabled={!selectedFile}
                              className="w-full"
                            >
                              <Upload className="mr-2 h-4 w-4" /> Upload
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => { setActiveTab("list"); resetForm(); }}>
                  Annuler
                </Button>
                <div className="flex space-x-2">
                  <Button 
                    variant={formData.active ? "outline" : "default"}
                    onClick={() => setFormData({...formData, active: !formData.active})}
                  >
                    {formData.active ? "Désactiver" : "Activer"}
                  </Button>
                  <Button onClick={handleUpdateConfig} disabled={!formData.name}>
                    Mettre à jour
                  </Button>
                </div>
              </CardFooter>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
} 