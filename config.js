import { @Vigilant, @SwitchProperty, @SelectorProperty} from  "../Vigilance/index"
const version = (JSON.parse(FileLib.read("ImageLinkFix", "metadata.json"))).version

@Vigilant("ImageLinkFix", "ImageLinkFix", {
  getCategoryComparator: () => (a, b) => {
    const categories = ["General"]
    return categories.indexOf(a.name) - categories.indexOf(b.name);
  }
})
class Settings {    
  @SelectorProperty({
    name: "Links to Encode",
    description: "Select what type of links you wish to encode",
    category: "General",
    options: ["All", "Only blocked links", "None"]
  })
  linksToEncode = 1;

  @SwitchProperty({
    name: "Toggle Arrow",
    description: "Turns on/off the little arrow that appears before links",
    category: "General"
  })
  arrowToggle = true 


  @SwitchProperty({
    name: "Toggle Module",
    description: "Turns on/off the whole module",
    category: "General"
  })
  globalToggle = true 

  constructor() {
    this.initialize(this);
    this.setCategoryDescription("General", `ImageLinkFix v${version}&r`);
  }
}
export default new Settings();