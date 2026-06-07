import {useLocation, useNavigate} from "react-router";
import {useRef, useState, useEffect} from "react";
import {generate3DView} from "../../lib/ai.action"
import {X, Box, Share2, Download, RefreshCcw} from "lucide-react";
import Button from "../../components/ui/Button";


const Visualiserid = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {initialImage, initialRender, name} = location.state || {};

  const hasInitialGenerated = useRef(false);

  const [isprocessing, setIsProcessing] = useState(false);
  const[currentImage, setCurrentImage] = useState<string | null>(initialRender || null);

  const handleBack = () => navigate('/');

  const runGeneration = async() => {
    if(!initialImage) return;

    try{
      setIsProcessing(true);
      const result = await generate3DView({sourceImage: initialImage});

      if(result.renderedImage){
        setCurrentImage(result.renderedImage);

      }

    } catch(e){
      console.error('Generation failed: ', e);
    } finally{
      setIsProcessing(false);
    }
  }

  

  useEffect(() => {
    if(!initialImage || hasInitialGenerated.current) return;

    if(initialRender){
      setCurrentImage(initialRender);
      hasInitialGenerated.current = true;
      return;
    }

    hasInitialGenerated.current = true;
    runGeneration();
  }, [initialImage,initialRender]);

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
              <h2>{'Untitled Project'}</h2>
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
                {initialImage && (
                  <img src={initialImage} alt="Original" className="render-fallback"/>
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