import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Utensils, 
  ShoppingBag, 
  HeartPulse, 
  Briefcase, 
  Circle, 
  Info, 
  Settings, 
  Star, 
  CheckSquare, 
  PenTool, 
  List, 
  Plus,
  Trash2,
  Edit2
} from "lucide-react";

export default function SurveyQuestionPage() {
  return (
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-10">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-semibold text-white">Survey Questions</h1>
          <p className="text-gray-400 mt-1">Manage the questions customers see when they scan your QR code</p>
        </div>
        <Button className="bg-[#0d9488] hover:bg-[#0f766e] text-white rounded-md flex items-center gap-2">
          <Plus size={16} />
          Add Custom Question
        </Button>
      </div>

      {/* Business Type Section */}
      <div className="space-y-2">
        <div className="flex items-center gap-4 p-3 rounded-lg border border-slate-800">
          <span className="text-xs font-semibold text-white tracking-wider w-32">BUSINESS TYPE</span>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="h-8 rounded-full text-slate-300 bg-slate-800/50 hover:bg-slate-800 hover:text-white px-4 font-normal gap-2">
              <Utensils size={14} className="text-slate-400" />
              Restaurant
            </Button>
            <Button variant="ghost" size="sm" className="h-8 rounded-full text-slate-300 bg-slate-800/50 hover:bg-slate-800 hover:text-white px-4 font-normal gap-2">
              <ShoppingBag size={14} className="text-teal-400" />
              Retail
            </Button>
            <Button variant="ghost" size="sm" className="h-8 rounded-full text-slate-300 bg-slate-800/50 hover:bg-slate-800 hover:text-white px-4 font-normal gap-2">
              <HeartPulse size={14} className="text-slate-400" />
              Healthcare
            </Button>
            <Button variant="ghost" size="sm" className="h-8 rounded-full text-slate-300 bg-slate-800/50 hover:bg-slate-800 hover:text-white px-4 font-normal gap-2">
              <Briefcase size={14} className="text-white" />
              Services
            </Button>
            <Button variant="outline" size="sm" className="h-8 rounded-full border-teal-500/30 bg-teal-500/10 text-teal-400 px-4 font-medium gap-2 hover:bg-teal-500/20 hover:text-teal-300">
              <Circle size={14} className="text-teal-400" />
              Other
            </Button>
          </div>
        </div>
        <p className="text-right text-xs text-slate-500 italic">Changing type resets preloaded questions</p>
      </div>

      {/* Preloaded Questions Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <span className="text-xs font-semibold text-slate-400 tracking-wider">PRELOADED QUESTIONS</span>
          <Info size={14} className="text-teal-400" />
        </div>

        <div className="space-y-3">
          {/* Question 1 */}
          <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 flex items-center justify-between group">
            <div className="flex gap-4 items-start">
              <div className="w-6 h-6 rounded-md bg-teal-500/20 text-teal-400 flex items-center justify-center text-sm font-medium shrink-0 mt-0.5">
                1
              </div>
              <div className="space-y-2">
                <p className="text-white font-medium">How would you rate your overall experience?</p>
                <div className="flex gap-2">
                  <Badge variant="secondary" className="bg-teal-500/10 text-teal-400 hover:bg-teal-500/20 font-normal rounded-md border-0 h-6 flex gap-1.5 items-center px-2">
                    <Star size={12} className="text-yellow-500 fill-yellow-500" />
                    Star Rating
                  </Badge>
                  <Badge variant="secondary" className="bg-slate-800 text-slate-300 hover:bg-slate-700 font-normal rounded-md border-0 h-6">
                    Preloaded
                  </Badge>
                  <Badge variant="secondary" className="bg-teal-500/10 text-teal-400 hover:bg-teal-500/20 font-normal rounded-md border-0 h-6">
                    Required
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button variant="outline" size="sm" className="h-8 text-slate-300 border-slate-700 hover:bg-slate-800 hover:text-white">Edit</Button>
              <Button variant="outline" size="sm" className="h-8 text-slate-300 border-slate-700 hover:bg-slate-800 hover:text-white">Delete</Button>
            </div>
          </div>

          {/* Question 2 */}
          <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 flex items-center justify-between group">
            <div className="flex gap-4 items-start">
              <div className="w-6 h-6 rounded-md bg-teal-500/20 text-teal-400 flex items-center justify-center text-sm font-medium shrink-0 mt-0.5">
                2
              </div>
              <div className="space-y-2">
                <p className="text-white font-medium">How satisfied were you with the quality of our service?</p>
                <div className="flex gap-2">
                  <Badge variant="secondary" className="bg-teal-500/10 text-teal-400 hover:bg-teal-500/20 font-normal rounded-md border-0 h-6 flex gap-1.5 items-center px-2">
                    <Star size={12} className="text-yellow-500 fill-yellow-500" />
                    Star Rating
                  </Badge>
                  <Badge variant="secondary" className="bg-slate-800 text-slate-300 hover:bg-slate-700 font-normal rounded-md border-0 h-6">
                    Preloaded
                  </Badge>
                  <Badge variant="secondary" className="bg-teal-500/10 text-teal-400 hover:bg-teal-500/20 font-normal rounded-md border-0 h-6">
                    Required
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button variant="outline" size="sm" className="h-8 text-slate-300 border-slate-700 hover:bg-slate-800 hover:text-white">Edit</Button>
              <Button variant="outline" size="sm" className="h-8 text-slate-300 border-slate-700 hover:bg-slate-800 hover:text-white">Delete</Button>
            </div>
          </div>

          {/* Question 3 */}
          <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 flex items-center justify-between group">
            <div className="flex gap-4 items-start">
              <div className="w-6 h-6 rounded-md bg-teal-500/20 text-teal-400 flex items-center justify-center text-sm font-medium shrink-0 mt-0.5">
                3
              </div>
              <div className="space-y-2">
                <p className="text-white font-medium">How friendly and helpful was our team?</p>
                <div className="flex gap-2">
                  <Badge variant="secondary" className="bg-teal-500/10 text-teal-400 hover:bg-teal-500/20 font-normal rounded-md border-0 h-6 flex gap-1.5 items-center px-2">
                    <Star size={12} className="text-yellow-500 fill-yellow-500" />
                    Star Rating
                  </Badge>
                  <Badge variant="secondary" className="bg-slate-800 text-slate-300 hover:bg-slate-700 font-normal rounded-md border-0 h-6">
                    Preloaded
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button variant="outline" size="sm" className="h-8 text-slate-300 border-slate-700 hover:bg-slate-800 hover:text-white">Edit</Button>
              <Button variant="outline" size="sm" className="h-8 text-slate-300 border-slate-700 hover:bg-slate-800 hover:text-white">Delete</Button>
            </div>
          </div>
          
          {/* Question 6 - Multiple Choice */}
          <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 flex items-center justify-between group">
            <div className="flex gap-4 items-start">
              <div className="w-6 h-6 rounded-md bg-teal-500/20 text-teal-400 flex items-center justify-center text-sm font-medium shrink-0 mt-0.5">
                6
              </div>
              <div className="space-y-2">
                <p className="text-white font-medium">What did you like the most about your experience?</p>
                <div className="flex gap-2">
                  <Badge variant="secondary" className="bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 font-normal rounded-md border-0 h-6 flex gap-1.5 items-center px-2">
                    <List size={12} className="text-blue-400" />
                    Multiple Choice
                  </Badge>
                  <Badge variant="secondary" className="bg-slate-800 text-slate-300 hover:bg-slate-700 font-normal rounded-md border-0 h-6">
                    Preloaded
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button variant="outline" size="sm" className="h-8 text-slate-300 border-slate-700 hover:bg-slate-800 hover:text-white">Edit</Button>
              <Button variant="outline" size="sm" className="h-8 text-slate-300 border-slate-700 hover:bg-slate-800 hover:text-white">Delete</Button>
            </div>
          </div>

          {/* Question 7 - Open Text */}
          <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 flex items-center justify-between group">
            <div className="flex gap-4 items-start">
              <div className="w-6 h-6 rounded-md bg-teal-500/20 text-teal-400 flex items-center justify-center text-sm font-medium shrink-0 mt-0.5">
                7
              </div>
              <div className="space-y-2">
                <p className="text-white font-medium">What could we do better next time?</p>
                <div className="flex gap-2">
                  <Badge variant="secondary" className="bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 font-normal rounded-md border-0 h-6 flex gap-1.5 items-center px-2">
                    <PenTool size={12} className="text-purple-400" />
                    Open Text
                  </Badge>
                  <Badge variant="secondary" className="bg-slate-800 text-slate-300 hover:bg-slate-700 font-normal rounded-md border-0 h-6">
                    Preloaded
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button variant="outline" size="sm" className="h-8 text-slate-300 border-slate-700 hover:bg-slate-800 hover:text-white">Edit</Button>
              <Button variant="outline" size="sm" className="h-8 text-slate-300 border-slate-700 hover:bg-slate-800 hover:text-white">Delete</Button>
            </div>
          </div>

        </div>
      </div>

      {/* Custom Questions Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <span className="text-xs font-semibold text-slate-400 tracking-wider">CUSTOM QUESTIONS</span>
          <Settings size={14} className="text-slate-500" />
        </div>

        <div className="rounded-xl border border-teal-900/50 bg-slate-900/20 p-6 border-dashed">
          <h3 className="text-lg font-medium text-white mb-6">New Custom Question</h3>
          
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-400 tracking-wider">QUESTION TYPE</label>
              <div className="grid grid-cols-4 gap-3">
                <button className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 border-teal-600 bg-teal-500/10 text-teal-400 transition-colors">
                  <Star size={20} className="text-yellow-500 fill-yellow-500" />
                  <span className="text-sm font-medium">Star Rating</span>
                </button>
                <button className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-slate-700 bg-slate-800/50 hover:bg-slate-800 text-slate-300 transition-colors">
                  <div className="flex items-center gap-1 font-semibold">
                    <CheckSquare size={16} /> <span className="text-xl leading-none">/</span> <span className="text-xl font-bold font-serif italic leading-none text-slate-500">X</span>
                  </div>
                  <span className="text-sm font-medium">Yes / No</span>
                </button>
                <button className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-slate-700 bg-slate-800/50 hover:bg-slate-800 text-slate-300 transition-colors">
                  <PenTool size={20} />
                  <span className="text-sm font-medium">Open Text</span>
                </button>
                <button className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-slate-700 bg-slate-800/50 hover:bg-slate-800 text-slate-300 transition-colors">
                  <List size={20} />
                  <span className="text-sm font-medium">Multiple Choice</span>
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-400 tracking-wider">QUESTION TEXT</label>
              <Textarea 
                placeholder="e.g. How would you rate our packaging?"
                className="min-h-[100px] resize-none bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-teal-500"
              />
            </div>
            
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-3">
                <button type="button" className="w-10 h-6 bg-slate-700 rounded-full flex items-center p-0.5 cursor-pointer transition-colors">
                  <div className="w-5 h-5 bg-slate-400 rounded-full shadow-sm transform transition-transform" />
                </button>
                <span className="text-sm font-medium text-slate-300">Mark as required</span>
              </div>
              
              <div className="flex gap-3">
                <Button className="bg-[#0d9488] hover:bg-[#0f766e] text-white px-6 font-medium">Add Question</Button>
                <Button variant="outline" className="text-slate-300 border-slate-700 px-6 font-medium hover:bg-slate-800 hover:text-white">Cancel</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
}