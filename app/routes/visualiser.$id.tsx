import {useLocation, useNavigate, useParams, useOutletContext} from "react-router";
import {useRef, useState, useEffect} from "react";
import {generate3DView} from "../../lib/ai.action"
import {X, Box, Share2, Download, RefreshCcw} from "lucide-react";
import Button from "../../components/ui/Button";
import { createProject, getProjectById } from "../../lib/puter.action";


const Visualiserid = () => {
  const {id} = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const{userId} = useOutletContext<AuthContext>();

  const hasInitialGenerated = useRef(false);

  const [project,setProject] = useState<DesignItem | null>(null);
  const[isProjectLoading, setIsProjectLoading] = useState(true);

  const [isprocessing, setIsProcessing] = useState(false);
  const[currentImage, setCurrentImage] = useState<string | null>(null);

  const handleBack = () => navigate('/');

  const runGeneration = async(item: DesignItem) => {
    if(!id || !item.sourceImage) return;

    try{
      setIsProcessing(true);
      const result = await generate3DView({sourceImage: item.sourceImage});

      if(result.renderedImage){
        setCurrentImage(result.renderedImage);

        const updatedItem = {
          ...item,
          renderedImage: result.renderedImage,
          renderedPath: result.renderedPath,
          timestamp: Date.now(),
          ownerId: item.ownerId ?? userId ?? null,
          isPublic: item.isPublic ?? false,
        }

        const saved = await createProject({ item: updatedItem, visibility: "private"})

        if(saved){
          setProject(saved);
          setCurrentImage(saved.renderedImage || result.renderedImage);
        }

      }

    } catch(e){
      console.error('Generation failed: ', e);
    } finally{
      setIsProcessing(false);
    }
  }

  

  useEffect(() => {
    let isMounted = true;

    const loadProject = async () => {
      if (!id) {
        setIsProjectLoading(false);
        return;
      }

      setIsProjectLoading(true);

      const fetchedProject = await getProjectById({ id });

      if (!isMounted) return;

      setProject(fetchedProject);
      setCurrentImage(fetchedProject?.renderedImage || null);
      setIsProjectLoading(false);
      hasInitialGenerated.current = false;
    };

    loadProject();

    return () => {
      isMounted = false;
    };
  }, [id]);

  useEffect(() => {
    if (
      isProjectLoading ||
      hasInitialGenerated.current ||
      !project?.sourceImage
    )
      return;

    if (project.renderedImage) {
      setCurrentImage(project.renderedImage);
      hasInitialGenerated.current = true;
      return;
    }

    hasInitialGenerated.current = true;
    void runGeneration(project);
  }, [project, isProjectLoading]);

  return (
    <div className="visualizer">
      <nav className = "topbar">
        <div className = "brand"> 
          <Box className ="logo"/>

          <span className="name">Roomify</span>
        </div>
        <Button variant = "ghost" size = "sm" onClick={handleBack} className="exit">
          <X className ="icon" /> Exit Editor

        </Button>
      </nav>

      <section className = "content">
        <div className="panel">
          <div className="panel-header">
            <div className="panel-meta">
              <p>Project</p>
              <h2>{project ?.name || `Project ${id}`}</h2>
              <p className="note">Created By You</p>
            </div>

            <div className="panel-actions">
              <Button
              size = "sm"
              onClick={() => {}}
              className="export"
              disabled={!currentImage}>
                <Download className="w-4 h-4 mr-2"/>Export
              </Button>

              <Button size = "sm" onClick={() =>{}} className="share">
                <Share2 className="w-4 h-4 mr-2"/>
                Share
              </Button>
            </div>
          </div>

          <div className={`render-area ${isprocessing?'is-processing':''}`}>
            {currentImage?(
              <img src={currentImage} alt="Ai Render" className="render-img"/>
            ):(
              <div className ="render-placeholder">
                {project?.sourceImage && (
                  <img src={project?.sourceImage} alt="Original" className="render-fallback"/>
                )}
              </div>
            )}

            {isprocessing && (
              <div className ="render-overlay">
                <div className="rendering-card">
                  <RefreshCcw className="spinner"/>
                  <span className="title">Rendering...</span>
                  <span className="subtitle">Generating 3D Layout</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

export default Visualiserid