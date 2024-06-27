

const Avatar = ({ name }: { name: string }) => {
  const intials = name.split(' ').map(i => i[0]).join('');

  return (<div 
    // className="flex h-full w-full  bg-muted" 
  className="relative inline-flex  items-center justify-center w-10 h-10 overflow-hidden bg-slate-200 rounded-full dark:bg-gray-600"
  >
    <span className="font-medium text-gray-600 dark:text-gray-300">{intials}</span>
  </div>)


}


export default Avatar;

